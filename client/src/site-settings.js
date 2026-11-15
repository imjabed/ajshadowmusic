// Browser-only metadata and file-URL settings for the AJ Shadow editor.
// Keep external images limited to http(s) or a local root-relative path.
export const FAVICON_PRESETS=[
 {id:'classic',label:'Classic mark',url:'/favicon.svg'},
 {id:'mask',label:'Shadow mask',url:'/favicons/mask.svg'},
 {id:'orbit',label:'Night orbit',url:'/favicons/orbit.svg'},
 {id:'aj',label:'AJ monogram',url:'/favicons/aj.svg'}
];
export function safeAssetUrl(value){
 if(typeof value!=='string')return '';
 const url=value.trim();
 if(url.startsWith('/')&&!url.startsWith('//')&&!url.startsWith('/\\'))return url;
 try{const parsed=new URL(url);if(parsed.protocol==='https:'||parsed.protocol==='http:')return url;}catch{}
 return '';
}
export function faviconSrc(branding={}){
 const custom=safeAssetUrl(branding.faviconUrl);
 if(custom)return custom;
 return FAVICON_PRESETS.find(p=>p.id===branding.faviconPreset)?.url||'/favicon.svg';
}
export function applyBrowserIdentity(branding={},admin=false){
 if(typeof document==='undefined')return;
 const defaultTitle=admin?'AJ SHADOW — Studio':'AJ SHADOW — No Face. Just Dreams.';
 const value=admin?branding.adminTitle:branding.pageTitle;
 document.title=(typeof value==='string'&&value.trim())||defaultTitle;
 let icon=document.querySelector('link[rel="icon"]');
 if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);}
 const src=faviconSrc(branding);
 if(icon.getAttribute('href')!==src)icon.setAttribute('href',src);
 if(src.toLowerCase().split('?')[0].endsWith('.svg'))icon.type='image/svg+xml';
 else icon.removeAttribute('type');
 if(!admin){
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content=String(branding.metaDescription||'');
  const color=document.querySelector('meta[name="theme-color"]');
  if(color&&/^#[0-9a-f]{6}$/i.test(branding.browserThemeColor||''))color.content=branding.browserThemeColor;
 }
}
export const bounded=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
