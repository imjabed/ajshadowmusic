// Render automatically sets RENDER=true in the build environment.
// Build static assets during deployment, not during each web-service startup.
if(process.env.RENDER==='true'){
 const {execFileSync}=require('node:child_process');
 execFileSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{stdio:'inherit'});
}
