export type User = {id:string;name:string;email:string};
export type Sound = {id:string;name:string;category:string;audioUrl:string;imageUrl:string;description:string};
export type WorkspaceSound = {id:string;soundId:string;volume:number;sound:Sound};
export type Workspace = {id:string;name:string;timerDuration:number;sounds:WorkspaceSound[];createdAt:string;updatedAt:string};
export type Session = {id:string;duration:number;completed:boolean;startedAt:string;completedAt:string|null};
export type Preference = {theme:'dark'|'light';defaultTimer:number;notifications:boolean;soundEnabled:boolean};
