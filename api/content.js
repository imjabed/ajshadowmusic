import {database,send} from './_db.js';
export default async function handler(req,res){
 if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
 try{const Model=await database();const doc=await Model.findOne({slug:'published'}).lean();return send(res,200,doc?.data||{});}
 catch(e){return send(res,e.status||503,{error:'Published content unavailable'});}
}
