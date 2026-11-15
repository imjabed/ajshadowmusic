/**
 * Vercel proxies /backend/* to Render. Direct Render uses same-origin /api/*.
 * If a Vercel project ignores vercel.json rewrites, safely retry at Render.
 */
const RENDER_API='https://ajshadowmusic-api.onrender.com';
const browserHost=()=>typeof window==='undefined'?'':window.location.hostname;
export function apiPath(path){
 const clean=path.startsWith('/')?path:'/'+path;
 const host=browserHost();
 if(host==='ajshadowmusic-api.onrender.com')return clean;
 if(host==='localhost'||host==='127.0.0.1'){
   const dev=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
   return dev+clean;
 }
 return '/backend'+clean;
}
export async function fetchApi(path,options={}){
 const pathname=path.startsWith('/')?path:'/'+path;
 const primary=apiPath(pathname);
 const isProxy=primary.startsWith('/backend/');
 if(!isProxy)return fetch(primary,options);
 try{
   const res=await fetch(primary,options);
   const jsonType=(res.headers.get('content-type')||'').toLowerCase().includes('application/json');
   if(jsonType&&res.status!==404&&res.status<500)return res;
   // A Vercel SPA fallback often returns 200 text/html for an unrecognized /backend route.
   // A legitimate API response is JSON. Only retry in known routing failure cases.
   if(!jsonType||res.status===404||res.status>=500)return fetch(RENDER_API+pathname,options);
   return res;
 }catch(error){
   return fetch(RENDER_API+pathname,options);
 }
}
