/**
 * Keep browser requests on their own origin.
 * Vercel forwards /backend/* to the Render Express API via vercel.json.
 * When served directly by Render, the API already shares the frontend origin.
 */
export function apiPath(path) {
 const cleanPath=path.startsWith('/')?path:'/'+path;
 if(typeof window==='undefined')return cleanPath;
 const host=window.location.hostname;
 if(host==='ajshadowmusic-api.onrender.com')return cleanPath;
 if(host==='localhost'||host==='127.0.0.1'){
  const devOrigin=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
  return devOrigin+cleanPath;
 }
 return '/backend'+cleanPath;
}
