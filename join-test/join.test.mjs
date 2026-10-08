// Tests for join-worker.js (no network): validation, honeypot, rate limit, duplicate, admin auth, CSV, /careers redirect, assets passthrough, escaping.
// Run: node join-test/join.test.mjs   (Node 24+, node:sqlite)
import {strict as assert} from 'node:assert';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker, {validate} from '../join-worker.js';
const db=new DatabaseSync(':memory:'); db.exec(readFileSync(new URL('../join-migrations/0001_join.sql',import.meta.url),'utf8'));
const stmt=sql=>{let b=[];const s={bind:(...a)=>{b=a;return s},run:async()=>{db.prepare(sql).run(...b);return{}},first:async()=>db.prepare(sql).get(...b)||null,all:async()=>({results:db.prepare(sql).all(...b)})};return s};
const env={DB:{prepare:stmt},ADMIN_KEY:'k-test-123',ASSETS:{fetch:async r=>new Response('ASSET '+new URL(r.url).pathname)}};
const good={name:'สมชาย ใจดี',nickname:'ชาย',age:'27',roles:['01','03'],phone:'081-234-5678',contact:'@somchai',portfolio:'example.com/me',intro:'ผมทำงานเลขามา 3 ปี ใช้ AI ทุกวัน อยากร่วมงานกับทีม',consent:true,company_site:'',t:Date.now()-8000};
const post=(b,h={})=>worker.fetch(new Request('https://badblood.company/api/join',{method:'POST',headers:{'content-type':'application/json',origin:'https://badblood.company','cf-connecting-ip':'1.2.3.4',...h},body:JSON.stringify(b)}),env);
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++};
// validation
ok(validate(good).ok&&validate(good).ok.portfolio==='https://example.com/me','valid + portfolio normalised');
for(const [k,v] of [['name','a'],['age','5'],['roles',[]],['roles',['01','02','03']],['roles',['99']],['phone','12'],['contact',''],['intro','สั้น'],['consent',false],['portfolio','javascript:alert(1)']]) ok(validate({...good,[k]:v}).error,'rejects '+k);
// submit ok
let r=await post(good);ok(r.status===200&&(await r.json()).ok,'submit ok');
ok(db.prepare('SELECT COUNT(*) c FROM applications').get().c===1,'row stored');
ok(db.prepare('SELECT ip_hash FROM applications').get().ip_hash.length===64&&!JSON.stringify(db.prepare('SELECT * FROM applications').all()).includes('1.2.3.4'),'ip stored as hash only');
// duplicate phone within 24h
r=await post({...good,name:'ซ้ำ ซ้ำ'});ok((await r.json()).duplicate===true&&db.prepare('SELECT COUNT(*) c FROM applications').get().c===1,'duplicate phone not stored twice');
// honeypot
r=await post({...good,phone:'0899999999',company_site:'http://spam'});ok(r.status===200&&db.prepare('SELECT COUNT(*) c FROM applications').get().c===1,'honeypot: fake ok, nothing stored');
// too fast, bad origin, content-type, bad json
r=await post({...good,phone:'0877777777',t:Date.now()-500});ok(r.status===429,'too fast');
r=await post({...good,phone:'0866666666'},{origin:'https://evil.example'});ok(r.status===403,'bad origin');
r=await post({...good,phone:'0866666666'},{'content-type':'text/plain'});ok(r.status===415,'content-type');
r=await worker.fetch(new Request('https://badblood.company/api/join',{method:'POST',headers:{'content-type':'application/json'},body:'{bad'}),env);ok(r.status===400,'bad json');
// rate limit (5/hour per IP): 1 stored + earlier rate rows; fire more with unique phones from same IP
let last;for(let i=0;i<8;i++){last=await post({...good,phone:'0811110'+String(i).padStart(3,'0')});}
ok(last.status===429,'rate limit kicks in');
r=await post({...good,phone:'0822222222'},{'cf-connecting-ip':'9.9.9.9'});ok(r.status===200,'other IP unaffected');
// admin
r=await worker.fetch(new Request('https://badblood.company/api/join/admin'),env);ok(r.status===403,'admin needs key');
r=await worker.fetch(new Request('https://badblood.company/api/join/export?k=wrong'),env);ok(r.status===403,'wrong key');
r=await worker.fetch(new Request('https://badblood.company/api/join/export?k=k-test-123'),env);const j=await r.json();ok(j.count>=2&&r.headers.get('cache-control')==='no-store','export json');
r=await worker.fetch(new Request('https://badblood.company/api/join/export?k=k-test-123&format=csv'),env);ok((await r.text()).includes('สมชาย')&&r.headers.get('content-type').startsWith('text/csv'),'export csv');
db.prepare("INSERT INTO applications VALUES('x',?,?,?,20,'[\"01\"]','0800000000','c',NULL,?,?, 'h','ua')").run(Date.now(),'<script>alert(1)</script>','n','<img src=x onerror=1>',Date.now());
r=await worker.fetch(new Request('https://badblood.company/api/join/admin?k=k-test-123'),env);const html=await r.text();ok(!html.includes('<script>alert(1)')&&html.includes('&lt;script&gt;')&&r.headers.get('content-security-policy').includes("default-src 'none'"),'admin html escaped + CSP');
r=await worker.fetch(new Request('https://badblood.company/api/join/admin?k=k-test-123'),{...env,ADMIN_KEY:undefined});ok(r.status===503,'admin disabled when no key');
// routing
r=await worker.fetch(new Request('https://badblood.company/careers'),env);ok(r.status===302&&r.headers.get('location')==='https://badblood.company/join','/careers → /join');
r=await worker.fetch(new Request('https://badblood.company/join'),env);ok((await r.text())==='ASSET /join','/join falls through to assets');
r=await worker.fetch(new Request('https://badblood.company/th'),env);ok((await r.text())==='ASSET /th','other pages untouched');
r=await worker.fetch(new Request('https://badblood.company/api/other'),env);ok(r.status===404,'unknown api 404');
// purge
await worker.scheduled({},env);ok(db.prepare('SELECT COUNT(*) c FROM applications').get().c>=2,'purge keeps fresh rows');
db.prepare("UPDATE applications SET created_at=? WHERE id='x'").run(Date.now()-200*86400e3);await worker.scheduled({},env);ok(db.prepare("SELECT COUNT(*) c FROM applications WHERE id='x'").get().c===0,'purge deletes >183 days');
console.log(`Verified ${n} join checks`);
