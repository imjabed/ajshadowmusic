import mongoose from 'mongoose';
const uri=process.env.MONGODB_URI;
const schema=new mongoose.Schema({slug:{type:String,unique:true,required:true},data:{type:mongoose.Schema.Types.Mixed,required:true},updatedAt:{type:Date,default:Date.now}},{versionKey:false});
const Model=mongoose.models.ShadowSite||mongoose.model('ShadowSite',schema);
export async function database(){
 if(!uri)throw Object.assign(new Error('MONGODB_URI is missing'),{status:503});
 if(mongoose.connection.readyState!==1)await mongoose.connect(uri,{serverSelectionTimeoutMS:7000,maxPoolSize:5});
 return Model;
}
export const send=(res,code,data)=>res.status(code).setHeader('Cache-Control','no-store').json(data);
