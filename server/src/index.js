import 'dotenv/config';import express from 'express';import cors from 'cors';import mongoose from 'mongoose';
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'100kb'}));app.use(cors({origin:process.env.CLIENT_ORIGIN||false}));
const schema=new mongoose.Schema({slug:{type:String,unique:true,default:'homepage'},project:mongoose.Schema.Types.Mixed,tracks:[mongoose.Schema.Types.Mixed],videos:[mongoose.Schema.Types.Mixed],labels:[mongoose.Schema.Types.Mixed],socials:mongoose.Schema.Types.Mixed},{timestamps:true,strict:false});
const Site=mongoose.model('Site',schema);
app.get('/api/health',(_,res)=>res.json({ok:true,database:mongoose.connection.readyState===1?'connected':'not-connected'}));
app.get('/api/content',async(_,res)=>{try{if(mongoose.connection.readyState!==1)return res.status(503).json({error:'Database not configured'});const d=await Site.findOne({slug:'homepage'}).select('-_id -__v').lean();res.json(d||{})}catch{res.status(500).json({error:'Unable to load content'})}});
app.use((_,res)=>res.status(404).json({error:'Not found'}));
const port=Number(process.env.PORT)||4000;
async function start(){if(process.env.MONGODB_URI){try{await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000})}catch(e){console.error('MongoDB connection failed:',e.message)}}app.listen(port,()=>console.log('AJ Shadow API running on port '+port))}
start();