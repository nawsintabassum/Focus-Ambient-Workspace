import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z, ZodError } from 'zod';

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 24) {
  console.error('JWT_SECRET must be set to a random secret of at least 24 characters.');
  process.exit(1);
}
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

type AuthedRequest = Request & { userId?: string };
function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string') throw new Error('Invalid token');
    req.userId = payload.sub;
    next();
  } catch { return res.status(401).json({ message: 'Your session expired. Please log in again.' }); }
}
const wrap = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) =>
 (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req as AuthedRequest, res)).catch(next);
const userSelect = { id:true, name:true, email:true, createdAt:true } as const;

app.get('/api/health', (_req,res) => res.json({ok:true}));
app.post('/api/auth/register', wrap(async (req,res) => {
 const schema = z.object({name:z.string().trim().min(2).max(70),email:z.string().trim().email().max(254),password:z.string().min(8).max(100),confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,{path:['confirmPassword'],message:'Passwords do not match.'});
 const data = schema.parse(req.body);
 const email = data.email.toLowerCase();
 if (await prisma.user.findUnique({where:{email}})) return res.status(409).json({message:'An account with this email already exists.'});
 const password = await bcrypt.hash(data.password, 12);
 await prisma.user.create({data:{name:data.name,email,password,preference:{create:{}}}});
 return res.status(201).json({message:'Account created. Please log in.'});
}));
app.post('/api/auth/login', wrap(async (req,res) => {
 const data = z.object({email:z.string().email(),password:z.string().min(1)}).parse(req.body);
 const user = await prisma.user.findUnique({where:{email:data.email.toLowerCase()}});
 if (!user || !(await bcrypt.compare(data.password,user.password))) return res.status(401).json({message:'Email or password is incorrect.'});
 const token = jwt.sign({},JWT_SECRET!,{subject:user.id,expiresIn:'7d'});
 return res.json({token,user:{id:user.id,name:user.name,email:user.email}});
}));
app.get('/api/auth/me', auth, wrap(async (req,res) => {
 const user = await prisma.user.findUnique({where:{id:req.userId},select:userSelect});
 if (!user) return res.status(401).json({message:'Account no longer exists.'});
 return res.json({user});
}));
app.post('/api/auth/logout', auth, (_req,res) => res.json({message:'Logged out.'}));

app.get('/api/sounds', wrap(async (_req,res) => res.json(await prisma.sound.findMany({orderBy:[{category:'asc'},{name:'asc'}]}))));
app.get('/api/favorites', auth, wrap(async (req,res) => {
 const rows = await prisma.favoriteSound.findMany({where:{userId:req.userId},include:{sound:true},orderBy:{createdAt:'desc'}});
 return res.json(rows.map(r=>r.sound));
}));
app.post('/api/favorites/:soundId', auth, wrap(async (req,res) => {
 const sound = await prisma.sound.findUnique({where:{id:req.params.soundId}});
 if (!sound) return res.status(404).json({message:'Sound not found.'});
 await prisma.favoriteSound.upsert({where:{userId_soundId:{userId:req.userId!,soundId:sound.id}},update:{},create:{userId:req.userId!,soundId:sound.id}});
 return res.status(201).json({message:'Added to favorites.'});
}));
app.delete('/api/favorites/:soundId', auth, wrap(async (req,res) => {
 await prisma.favoriteSound.deleteMany({where:{userId:req.userId,soundId:req.params.soundId}});
 return res.json({message:'Removed from favorites.'});
}));

const workspaceSchema = z.object({name:z.string().trim().min(1).max(60),timerDuration:z.number().int().min(1).max(180),sounds:z.array(z.object({soundId:z.string(),volume:z.number().int().min(0).max(100)})).max(24)});
app.get('/api/workspaces', auth, wrap(async (req,res) => res.json(await prisma.workspace.findMany({where:{userId:req.userId},include:{sounds:{include:{sound:true}}},orderBy:{updatedAt:'desc'}}))));
app.post('/api/workspaces', auth, wrap(async (req,res) => {
 const d=workspaceSchema.parse(req.body);
 const w=await prisma.workspace.create({data:{userId:req.userId!,name:d.name,timerDuration:d.timerDuration,sounds:{create:d.sounds.map(s=>({soundId:s.soundId,volume:s.volume}))}},include:{sounds:{include:{sound:true}}}});
 return res.status(201).json(w);
}));
app.get('/api/workspaces/:id', auth, wrap(async (req,res) => {
 const w=await prisma.workspace.findFirst({where:{id:req.params.id,userId:req.userId},include:{sounds:{include:{sound:true}}}});
 if(!w) return res.status(404).json({message:'Workspace not found.'}); return res.json(w);
}));
app.put('/api/workspaces/:id', auth, wrap(async (req,res) => {
 const d=workspaceSchema.parse(req.body);
 const existing=await prisma.workspace.findFirst({where:{id:req.params.id,userId:req.userId}});
 if(!existing) return res.status(404).json({message:'Workspace not found.'});
 const w=await prisma.workspace.update({where:{id:existing.id},data:{name:d.name,timerDuration:d.timerDuration,sounds:{deleteMany:{},create:d.sounds.map(s=>({soundId:s.soundId,volume:s.volume}))}},include:{sounds:{include:{sound:true}}}});
 return res.json(w);
}));
app.delete('/api/workspaces/:id', auth, wrap(async (req,res) => {
 const w=await prisma.workspace.findFirst({where:{id:req.params.id,userId:req.userId}});
 if(!w) return res.status(404).json({message:'Workspace not found.'});
 await prisma.workspace.delete({where:{id:w.id}}); return res.json({message:'Workspace deleted.'});
}));

app.post('/api/sessions', auth, wrap(async (req,res) => {
 const d=z.object({duration:z.number().int().min(1).max(180),completed:z.boolean(),startedAt:z.string().datetime().optional()}).parse(req.body);
 const startedAt=d.startedAt?new Date(d.startedAt):new Date();
 return res.status(201).json(await prisma.focusSession.create({data:{userId:req.userId!,duration:d.duration,completed:d.completed,startedAt,completedAt:d.completed?new Date():null}}));
}));
app.get('/api/sessions', auth, wrap(async (req,res) => {
 const limit=Math.min(Number(req.query.limit)||10,100);
 return res.json(await prisma.focusSession.findMany({where:{userId:req.userId},orderBy:{startedAt:'desc'},take:limit}));
}));
function startOfDay(d:Date){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
app.get('/api/dashboard', auth, wrap(async (req,res) => {
 const now=new Date(), today=startOfDay(now), week=new Date(today); week.setDate(week.getDate()-6);
 const [todayRows,allRows,weekRows,recent,favorites,workspaces]=await Promise.all([
 prisma.focusSession.findMany({where:{userId:req.userId,startedAt:{gte:today},completed:true}}),
 prisma.focusSession.findMany({where:{userId:req.userId,completed:true},orderBy:{startedAt:'desc'}}),
 prisma.focusSession.findMany({where:{userId:req.userId,startedAt:{gte:week},completed:true}}),
 prisma.focusSession.findMany({where:{userId:req.userId},orderBy:{startedAt:'desc'},take:5}),
 prisma.favoriteSound.findMany({where:{userId:req.userId},include:{sound:true},take:5}),
 prisma.workspace.findMany({where:{userId:req.userId},include:{sounds:{include:{sound:true}}},take:5,orderBy:{updatedAt:'desc'}})
 ]);
 let streak=0; const days=new Set(allRows.map(r=>startOfDay(r.startedAt).toDateString()));
 let cursor=startOfDay(now); if(!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate()-1);
 while(days.has(cursor.toDateString())){streak++;cursor.setDate(cursor.getDate()-1);}
 return res.json({todayMinutes:todayRows.reduce((n,r)=>n+r.duration,0),totalSessions:allRows.length,completedSessions:allRows.length,streak,weeklyMinutes:weekRows.reduce((n,r)=>n+r.duration,0),recent,favorites:favorites.map(x=>x.sound),workspaces});
}));
app.get('/api/analytics', auth, wrap(async (req,res) => {
 const range=String(req.query.range||'7d'); const days=range==='today'?1:range==='30d'?30:7;
 const from=startOfDay(new Date()); from.setDate(from.getDate()-(days-1));
 const rows=await prisma.focusSession.findMany({where:{userId:req.userId,completed:true,startedAt:{gte:from}},orderBy:{startedAt:'asc'}});
 const buckets=new Map<string,number>();
 for(let i=0;i<days;i++){const d=new Date(from);d.setDate(from.getDate()+i);buckets.set(d.toISOString().slice(0,10),0);}
 for(const r of rows){const key=r.startedAt.toISOString().slice(0,10);buckets.set(key,(buckets.get(key)||0)+r.duration);}
 const all=await prisma.focusSession.findMany({where:{userId:req.userId,completed:true}});
 return res.json({range,daily:[...buckets.entries()].map(([date,minutes])=>({date,minutes})),sessions:rows.length,totalMinutes:rows.reduce((n,r)=>n+r.duration,0),averageMinutes:all.length?Math.round(all.reduce((n,r)=>n+r.duration,0)/all.length):0});
}));
app.get('/api/profile', auth, wrap(async (req,res) => {
 const user=await prisma.user.findUnique({where:{id:req.userId},select:userSelect});
 const preference=await prisma.userPreference.findUnique({where:{userId:req.userId}});
 return res.json({user,preference});
}));
app.put('/api/profile', auth, wrap(async (req,res) => {
 const d=z.object({name:z.string().trim().min(2).max(70),email:z.string().trim().email().max(254)}).parse(req.body);
 const email=d.email.toLowerCase();
 const other=await prisma.user.findFirst({where:{email,id:{not:req.userId}}});
 if(other)return res.status(409).json({message:'That email is already in use.'});
 const user=await prisma.user.update({where:{id:req.userId},data:{name:d.name,email},select:userSelect});
 return res.json({user});
}));
app.put('/api/profile/password', auth, wrap(async (req,res) => {
 const d=z.object({currentPassword:z.string().min(1),newPassword:z.string().min(8).max(100)}).parse(req.body);
 const user=await prisma.user.findUnique({where:{id:req.userId}});
 if(!user || !(await bcrypt.compare(d.currentPassword,user.password)))return res.status(400).json({message:'Current password is incorrect.'});
 await prisma.user.update({where:{id:req.userId},data:{password:await bcrypt.hash(d.newPassword,12)}});
 return res.json({message:'Password updated successfully.'});
}));
app.get('/api/settings', auth, wrap(async (req,res) => {
 const preference=await prisma.userPreference.upsert({where:{userId:req.userId!},update:{},create:{userId:req.userId!}});
 return res.json(preference);
}));
app.put('/api/settings', auth, wrap(async (req,res) => {
 const d=z.object({theme:z.enum(['dark','light']),defaultTimer:z.number().int().min(1).max(180),notifications:z.boolean(),soundEnabled:z.boolean()}).parse(req.body);
 return res.json(await prisma.userPreference.upsert({where:{userId:req.userId!},update:d,create:{userId:req.userId!,...d}}));
}));
app.use((_req,res)=>res.status(404).json({message:'That endpoint was not found.'}));
app.use((err:unknown,_req:Request,res:Response,_next:NextFunction)=>{
 if(err instanceof ZodError)return res.status(400).json({message:'Please check the form fields.',errors:err.issues.map(i=>({field:i.path.join('.'),message:i.message}))});
 console.error(err);
 return res.status(500).json({message:'Something went wrong. Please try again.'});
});
app.listen(PORT,()=>console.log(`Focus Ambient API running at http://localhost:${PORT}`));
