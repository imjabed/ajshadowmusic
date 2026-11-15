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
async function mockBackend(page,{broken=false,content=site}={}){
 await page.route(/\/api\/admin$/,async route=>{
  const req=route.request();
  const body=req.postDataJSON?.()||{};
  const reply=(status,json)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(json),headers:{'Cache-Control':'no-store'}});
  if(req.method()==='POST'&&body.action==='login')return reply(200,{token:'test-session-token'});
  if(req.method()==='GET')return broken?reply(503,{error:'Database unavailable'}):reply(200,{draft:content,publishedAt:'2026-01-01T00:00:00.000Z'});
  if(req.method()==='PUT')return reply(200,{ok:true,status:'draft saved'});
  if(req.method()==='POST'&&body.action==='publish')return reply(200,{ok:true,status:'published'});
  return reply(404,{error:'not found'});
 });
 await page.route(/\/api\/content$/,r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(content)}));
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


test('brand, favicon, browser titles and published payload are editable',async({page})=>{
 await mockBackend(page);
 await page.goto('/admin');
 await page.locator('#shadow-admin-password').fill('test-only-password');
 await page.locator('input[type="submit"]').click();
 await expect(page.getByText('WEBSITE EDITOR')).toBeVisible({timeout:12000});
 await page.getByRole('button',{name:'Branding'}).click();
 await expect(page.getByText('Brand Identity')).toBeVisible();
 await page.getByRole('button',{name:'AJ mark'}).click();
 await page.getByLabel('Public website tab title').fill('AJ SHADOW — NEW CHAPTER');
 await page.getByLabel('Admin Studio tab title').fill('My Shadow Editing Studio');
 await expect(page).toHaveTitle('My Shadow Editing Studio');
 await page.getByRole('button',{name:'Use Night orbit favicon'}).click();
 await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','/favicons/orbit.svg');
 const wait=page.waitForRequest(r=>r.method()==='PUT'&&/\/api\/admin$/.test(r.url()));
 await page.getByRole('button',{name:'Save Draft'}).click();
 const request=await wait;
 const saved=request.postDataJSON().data;
 expect(saved.branding.logoUrl).toBe('/favicons/aj.svg');
 expect(saved.branding.pageTitle).toBe('AJ SHADOW — NEW CHAPTER');
 expect(saved.branding.faviconPreset).toBe('orbit');
 await page.getByRole('button',{name:'Publish',exact:true}).click();
 await expect(page.getByText(/Published!/)).toBeVisible();
});

test('motion controls and quick presets persist in the draft',async({page})=>{
 await mockBackend(page);
 await page.goto('/admin');
 await page.locator('#shadow-admin-password').fill('test-only-password');
 await page.locator('input[type="submit"]').click();
 await expect(page.getByText('WEBSITE EDITOR')).toBeVisible({timeout:12000});
 await page.getByRole('button',{name:'Motion FX'}).click();
 await expect(page.getByText('Motion & Effects')).toBeVisible();
 await page.getByRole('button',{name:'Subtle'}).click();
 await page.getByRole('checkbox',{name:/Mouse-following glow/}).check();
 await page.getByRole('checkbox',{name:/Glitch title animation/}).check();
 const wait=page.waitForRequest(r=>r.method()==='PUT'&&/\/api\/admin$/.test(r.url()));
 await page.getByRole('button',{name:'Save Draft'}).click();
 const saved=(await wait).postDataJSON().data;
 expect(saved.effects.particleCount).toBe(7);
 expect(saved.effects.pointerGlow).toBe(true);
 expect(saved.effects.titleGlitch).toBe(true);
 expect(saved.theme.parallax).toBe(20);
});

test('published site uses dynamic logo, browser favicon and disabled motion',async({page})=>{
 const custom={
  ...site,
  branding:{siteName:'SHADOW NEW',logoMode:'image',logoUrl:'/favicons/mask.svg',pageTitle:'AJ SHADOW • THE NEXT ERA',faviconPreset:'aj',metaDescription:'Welcome to Shadow music.',browserThemeColor:'#151119'},
  effects:{motionEnabled:false,heroGlow:false,ambientGlow:false,pointerGlow:false,floatingSymbols:false,particleCount:0}
 };
 await mockBackend(page,{content:custom});
 await page.goto('/');
 await expect(page).toHaveTitle('AJ SHADOW • THE NEXT ERA');
 await expect(page.locator('header .brand-image')).toHaveAttribute('src','/favicons/mask.svg');
 await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href','/favicons/aj.svg');
 await expect(page.locator('.hero-glow')).toHaveCount(0);
 await expect(page.locator('.shadow-particles')).toHaveCount(0);
});
