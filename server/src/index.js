import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import adminHandler from '../../api/admin.js';
import contentHandler from '../../api/content.js';
import {database} from '../../lib/db.js';

const app=express();
app.disable('x-powered-by');
app.set('trust proxy',1);
app.use(express.json({limit:'350kb'}));
const allowed=(process.env.CLIENT_ORIGIN||'').split(',').map(x=>x.trim()).filter(Boolean);
app.use(cors({
 origin(origin,cb){
   if(!origin||allowed.includes(origin)||/^http:\/\/localhost:(3000|5173|5174)$/.test(origin))return cb(null,true);
   return cb(null,false);
 },
 methods:['GET','POST','PUT','OPTIONS'],
 allowedHeaders:['Content-Type','Authorization']
}));
app.get('/api/health',(_,res)=>res.json({ok:true,database:mongoose.connection.readyState===1?'connected':'not-connected'}));
app.all('/api/content',(req,res)=>contentHandler(req,res));
app.all('/api/admin',(req,res)=>adminHandler(req,res));
const staticRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../client/dist');
app.use(express.static(staticRoot,{index:false}));
app.get('*',(req,res)=>res.sendFile(path.join(staticRoot,'index.html'),err=>{if(err&&!res.headersSent)res.status(404).json({error:'Frontend not built'})}));

const port=Number(process.env.PORT)||4000;
app.listen(port,'0.0.0.0',()=>console.log('AJ Shadow website and API listening on port '+port));
console.log('Admin setup check: password='+ (process.env.ADMIN_PASSWORD?'configured':'missing') +', sessionSecret='+(process.env.ADMIN_SESSION_SECRET?.length>=32?'valid':'missing-or-too-short'));
if(process.env.MONGODB_URI)database().then(()=>console.log('MongoDB connection established')).catch(e=>console.error('MongoDB connection check failed:',e.name));
