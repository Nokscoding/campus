import webpush from 'web-push';
import {timingSafeEqual} from 'node:crypto';
import {NextResponse} from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const origins=new Set(['https://www.campus-rdc.com','https://campus-rdc.com','https://admin.campus-rdc.com']);
function safeEndpoint(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return false;
 const h=u.hostname.toLowerCase();
 return h==='fcm.googleapis.com'||h==='updates.push.services.mozilla.com'||h==='web.push.apple.com'||
 h==='api.push.apple.com'||h.endsWith('.push.apple.com')||h.endsWith('.notify.windows.com')||h.endsWith('.push.services.mozilla.com');
 }catch{return false}
}
export async function POST(req){
 const expected=process.env.CAMPUS_PUSH_WEBHOOK_SECRET,token=req.headers.get('x-campus-push-token')||'';
 if(!expected||!token||Buffer.byteLength(expected)!==Buffer.byteLength(token)||
  !timingSafeEqual(Buffer.from(token),Buffer.from(expected)))return NextResponse.json({error:'Unauthorized'},{status:401});
 if(Number(req.headers.get('content-length')||0)>30000)return NextResponse.json({error:'Payload too large'},{status:413});
 let data;try{data=await req.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 if(!data||typeof data.title!=='string'||!Array.isArray(data.subscriptions)||data.subscriptions.length>8)
  return NextResponse.json({error:'Invalid payload'},{status:400});
 const pub=process.env.NEXT_PUBLIC_CAMPUS_VAPID_PUBLIC_KEY,priv=process.env.CAMPUS_VAPID_PRIVATE_KEY;
 if(!pub||!priv)return NextResponse.json({error:'Push unconfigured'},{status:503});
 webpush.setVapidDetails('mailto:nksserviceshelp@gmail.com',pub,priv);
 const results=await Promise.allSettled(data.subscriptions.map(async s=>{
  if(!s||!origins.has(s.origin)||!safeEndpoint(s.endpoint)||!s.keys?.auth||!s.keys?.p256dh)return false;
  const admin=s.origin==='https://admin.campus-rdc.com';
  const path=admin?(data.kind==='listing_review_requested'?'/?tab=listings':data.kind==='bug_reported'?'/?tab=bugs':'/?tab=orders'):
   String(data.kind||'').startsWith('listing_')?'/compte?onglet=notifications':'/compte?onglet=notifications';
  const payload=JSON.stringify({id:data.id,title:'CAMPUS · '+data.title,body:data.body||'',url:path});
  await webpush.sendNotification({endpoint:s.endpoint,keys:s.keys},payload,{TTL:3600});
  return true;
 }));
 const sent=results.filter(x=>x.status==='fulfilled'&&x.value===true).length;
 return NextResponse.json({ok:true,attempted:results.length,sent,failed:results.length-sent});
}
