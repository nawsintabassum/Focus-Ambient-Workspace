import {createContext,useContext,useEffect,useState,ReactNode} from 'react';
import {api,getToken,setToken} from '../services/api';
import type {User} from '../types';
type AuthValue={user:User|null;loading:boolean;login:(email:string,password:string)=>Promise<void>;register:(name:string,email:string,password:string,confirmPassword:string)=>Promise<void>;logout:()=>Promise<void>;refresh:()=>Promise<void>};
const C=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true);
 const refresh=async()=>{if(!getToken()){setUser(null);setLoading(false);return;}try{const r=await api<{user:User}>('/auth/me');setUser(r.user);}catch{setToken(null);setUser(null);}finally{setLoading(false);}};
 useEffect(()=>{void refresh();},[]);
 const login=async(email:string,password:string)=>{const r=await api<{token:string;user:User}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});setToken(r.token);setUser(r.user);};
 const register=async(name:string,email:string,password:string,confirmPassword:string)=>{await api('/auth/register',{method:'POST',body:JSON.stringify({name,email,password,confirmPassword})});};
 const logout=async()=>{try{if(getToken())await api('/auth/logout',{method:'POST'});}finally{setToken(null);setUser(null);}};
 return <C.Provider value={{user,loading,login,register,logout,refresh}}>{children}</C.Provider>;
}
export function useAuth(){const v=useContext(C);if(!v)throw new Error('useAuth must be used inside AuthProvider');return v;}
