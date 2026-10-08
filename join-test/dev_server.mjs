// Local rehearsal: static files + join-worker with an in-memory SQLite DB.  node join-test/dev_server.mjs 8795
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,statSync} from 'node:fs';
import {extname,resolve} from 'node:path';
import worker from '../join-worker.js';
const root=resolve(new URL('..',import.meta.url).pathname),port=+(process.argv[2]||8795);
const db=new DatabaseSync(':memory:');db.exec(readFileSync(root+'/join-migrations/0001_join.sql','utf8'));
const stmt=sql=>{let b=[];const s={bind:(...a)=>{b=a;return s},run:async()=>{db.prepare(sql).run(...b);return{}},first:async()=>db.prepare(sql).get(...b)||null,all:async()=>({results:db.prepare(sql).all(...b)})};return s};
const mime={'.html':'text/html; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.css':'text/css','.js':'text/javascript'};
const ASSETS={async fetch(r){let p=decodeURIComponent(new URL(r.url).pathname);if(p==='/join')p='/join.html';try{const f=resolve(root,'.'+p);if(!f.startsWith(root)||!statSync(f).isFile())throw 0;return new Response(readFileSync(f),{headers:{'content-type':mime[extname(f)]||'application/octet-stream'}})}catch{return new Response('nf',{status:404})}}};
const env={DB:{prepare:stmt},ASSETS,ADMIN_KEY:'local-admin'};
createServer(async(q,s)=>{const ch=[];for await(const c of q)ch.push(c);const body=Buffer.concat(ch);const h=new Headers();for(const[k,v]of Object.entries(q.headers))h.set(k,String(v));if(h.get('origin'))h.set('origin','https://badblood.company'); /* rehearsal only */
 const req=new Request('http://localhost:'+port+q.url,{method:q.method,headers:h,body:['GET','HEAD'].includes(q.method)?undefined:body});
 const r=await worker.fetch(req,env);s.writeHead(r.status,Object.fromEntries(r.headers));s.end(Buffer.from(await r.arrayBuffer()))}).listen(port,()=>console.log('join dev on',port));
