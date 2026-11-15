import {test,expect} from '@playwright/test';

const site={
 artist:'AJ SHADOW',
 project:{eyebrow:'THE NEXT CHAPTER · 2027',title:'THE CHASE',label:'FIVE STORIES. ONE PURSUIT.',tagline:'For those who never stop chasing.',image:'/shadow.svg',buttonText:'LISTEN NOW',secondButton:'WATCH VISUALS'},
 tracks:[{title:'If I Could',artist:'AJ Shadow',audioUrl:'',spotifyUrl:''}],
 videos:[{title:'THE CHASE',subtitle:'PROJECT FILM',youtubeId:''}],
 labels:[{name:'Spiration Music',subtitle:'RELEASE PARTNER'}],
 texts:{musicHeading:'THE MUSIC.',aboutHeading:'WHO IS SHADOW?',heroScroll:'SCROLL TO EXPLORE'},
 theme:{accent:'#d94d64',background:'#09090c',surface:'#18131a',text:'#f7f2f2',font:'DM Sans',headingFont:'Barlow Condensed',parallax:60},
 images:{music:'/shadow.svg',about:'/shadow.svg'},
 sections:[{id:'home',visible:true},{id:'music',visible:true},{id:'videos',visible:true},{id:'labels',visible:true},{id:'about',visible:true},{id:'outro',visible:true}],
 socials:{youtube:'https://www.youtube.com/@AJShadowmusic',instagram:'https://www.instagram.com/ajshadowmusic'}
};
async function mockBackend(page,{broken=false}={}){
 await page.route(/\/api\/admin$/,async route=>{
  const req=route.request();
  const body=req.postDataJSON?.()||{};
  const reply=(status,json)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(json),headers:{'Cache-Control':'no-store'}});
  if(req.method()==='POST'&&body.action==='login')return reply(200,{token:'test-session-token'});
  if(req.method()==='GET')return broken?reply(503,{error:'Database unavailable'}):reply(200,{draft:site,publishedAt:'2026-01-01T00:00:00.000Z'});
  if(req.method()==='PUT')return reply(200,{ok:true,status:'draft saved'});
  if(req.method()==='POST'&&body.action==='publish')return reply(200,{ok:true,status:'published'});
  return reply(404,{error:'not found'});
 });
 await page.route(/\/api\/content$/,r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(site)}));
}

test('login form stays visible and submitting opens a working editor',async({page})=>{
 await mockBackend(page);
 await page.goto('/admin');
 const field=page.locator('#shadow-admin-password');
 const submit=page.locator('input[type="submit"]');
 await expect(field).toBeVisible();
 await field.fill('dummy-test-password');
 await expect(submit).toBeVisible();
 await expect(submit).toBeEnabled();
 await submit.click();
 await expect(page.getByText('WEBSITE EDITOR')).toBeVisible({timeout:12000});
 await expect(page.getByText('Current Project')).toBeVisible();
 await page.getByRole('button',{name:'Songs'}).click();
 await expect(page.getByText('Music Library')).toBeVisible();
 await page.getByRole('button',{name:'Labels'}).click();
 await expect(page.getByText('Record Labels')).toBeVisible();
});

test('failed content request shows an error rather than a blank page',async({page})=>{
 await mockBackend(page,{broken:true});
 await page.goto('/admin');
 await page.locator('#shadow-admin-password').fill('dummy-test-password');
 await page.locator('input[type="submit"]').click();
 await expect(page.getByText('WEBSITE EDITOR')).toBeVisible({timeout:12000});
 await expect(page.getByText(/Database unavailable/)).toBeVisible();
});

test('can save and publish a changed hero title',async({page})=>{
 await mockBackend(page);
 await page.goto('/admin');
 await page.locator('#shadow-admin-password').fill('dummy-test-password');
 await page.locator('input[type="submit"]').click();
 await expect(page.getByText('Current Project')).toBeVisible({timeout:12000});
 const title=page.getByLabel('Project title');
 await title.fill('NEW CHAPTER');
 await page.getByRole('button',{name:'Save Draft'}).click();
 await expect(page.getByText(/Draft saved/)).toBeVisible();
 await page.getByRole('button',{name:'Publish',exact:true}).click();
 await expect(page.getByText(/Published!/)).toBeVisible();
});
