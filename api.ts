const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export function getToken(){return localStorage.getItem('focus_token');}
export function setToken(token:string|null){if(token)localStorage.setItem('focus_token',token);else localStorage.removeItem('focus_token');}
export async function api<T=any>(path:string, options:RequestInit = {}):Promise<T>{
 const token=getToken();
 const headers:Record<string,string>={'Content-Type':'application/json',...(options.headers as Record<string,string>||{})};
 if(token)headers.Authorization=`Bearer ${token}`;
 const response=await fetch(`${API}${path}`,{...options,headers});
 const data=await response.json().catch(()=>({message:'The server returned an unreadable response.'}));
 if(!response.ok)throw new Error(data.message||`Request failed (${response.status})`);
 return data as T;
}
