import {createHmac,timingSafeEqual,randomBytes,createHash} from 'node:crypto';
import {database,send} from '../lib/db.js';
const maxBytes=350000;
const hmac=value=>createHmac('sha256',process.env.ADMIN_SESSION_SECRET).update(value).digest('hex');
const eq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)};
function verified(req){
 const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 const [payload,sig]=token.split('.');
 if(!payload||!sig||!eq(hmac(payload),sig))return false;
 try{const obj=JSON.parse(Buffer.from(payload,'base64url').toString());return obj.role==='admin'&&obj.exp>Date.now();}catch{return false}
}
function safeURL(s){if(!s)return true;if(typeof s!=='string')return false;try{const u=new URL(s, 'https://placeholder.invalid');return ['https:','http:'].includes(u.protocol)||s.startsWith('/')&&!s.startsWith('//')}catch{return false}}
function validate(data){
 if(!data||typeof data!=='object'||Array.isArray(data))return false;
 if(JSON.stringify(data).length>maxBytes)return false;
 for(const key of ['tracks','videos','labels'])if(data[key]&&(!Array.isArray(data[key])||data[key].length>80))return false;
 const links=[];
 const visit=(v,k='')=>{if(Array.isArray(v))v.forEach(x=>visit(x));else if(v&&typeof v==='object')Object.entries(v).forEach(([a,b])=>visit(b,a));else if(typeof v==='string'&&/^(image|url|link|spotify|youtube|instagram|soundcloud|heroMedia)$/i.test(k))links.push(v)};
 visit(data);return links.every(safeURL);
}
export default async function handler(req,res){
 if(!['POST','GET','PUT'].includes(req.method))return send(res,405,{error:'Method not allowed'});
 const secret=process.env.ADMIN_SESSION_SECRET;const pass=process.env.ADMIN_PASSWORD;
 if(!secret||secret.length<32||!pass)return send(res,503,{error:'Admin credentials are not fully configured in Render. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (at least 32 characters).'});
 if(req.method==='POST'&&req.body?.action==='login'){
  if(typeof req.body.password!=='string')return send(res,400,{error:'Invalid credentials'});
  if(!eq(req.body.password,pass))return send(res,401,{error:'Invalid credentials'});
  const payload=Buffer.from(JSON.stringify({role:'admin',exp:Date.now()+8*60*60*1000,nonce:randomBytes(6).toString('hex')})).toString('base64url');
  return send(res,200,{token:payload+'.'+hmac(payload)});
 }
 if(!verified(req))return send(res,401,{error:'Session expired or unauthorized'});
 if(req.method==='POST'&&req.body?.action==='sign_upload'){
  const cloudName=process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey=process.env.CLOUDINARY_API_KEY;
  const apiSecret=process.env.CLOUDINARY_API_SECRET;
  if(!cloudName||!apiKey||!apiSecret)return send(res,503,{error:'Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable uploads. You can paste an image URL without these.'});
  const timestamp=Math.floor(Date.now()/1000);
  const folder='ajshadowmusic';
  const signature=createHash('sha1').update('folder='+folder+'&timestamp='+timestamp+apiSecret).digest('hex');
  return send(res,200,{cloudName,apiKey,timestamp,folder,signature});
 }
 try{
  const Model=await database();
  if(req.method==='GET'){
   const [draft,published]=await Promise.all([Model.findOne({slug:'draft'}).lean(),Model.findOne({slug:'published'}).lean()]);
   return send(res,200,{draft:draft?.data||published?.data||null,publishedAt:published?.updatedAt||null});
  }
  if(req.method==='PUT'){
   if(!validate(req.body?.data))return send(res,400,{error:'Invalid content or unsafe URL'});
   await Model.findOneAndUpdate({slug:'draft'},{$set:{data:req.body.data,updatedAt:new Date()}},{upsert:true});
   return send(res,200,{ok:true,status:'draft saved'});
  }
  if(req.body?.action==='publish'){
   const draft=await Model.findOne({slug:'draft'}).lean();
   if(!draft)return send(res,400,{error:'Save a draft first'});
   await Model.findOneAndUpdate({slug:'published'},{$set:{data:draft.data,updatedAt:new Date()}},{upsert:true});
   return send(res,200,{ok:true,status:'published'});
  }
  return send(res,400,{error:'Unknown action'});
 }catch(e){return send(res,e.status||500,{error:'Database unavailable'});}
}
