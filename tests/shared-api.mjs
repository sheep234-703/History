import assert from 'node:assert/strict';
const root=process.env.TEST_ORIGIN||'http://127.0.0.1:4173';
async function call(body,cookie){const r=await fetch(root+'/api/moments',{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
const a=await call({action:'publish',nickname:'功能测试',eventId:'e01',role:'今天的阅读者',content:'共享存储集成测试',images:['assets/e1-1.jpg']});assert.equal(a.status,200);assert.ok(a.cookie);const id=a.data.id;
try{
 const b=await call();const p=b.data.posts.find(x=>x.id===id);assert.ok(p,'anonymous visitor reads shared post');assert.equal(p.owned,false);assert.equal(p.author,undefined);assert.deepEqual(p.images,['assets/e1-1.jpg']);
 assert.equal((await call({action:'hide',postId:id})).status,403,'another visitor cannot withdraw');
 const like=await call({action:'like',postId:id});assert.equal(like.status,200);const bc=like.cookie;await call({action:'like',postId:id},bc);let bpost=(await call(null,bc)).data.posts.find(x=>x.id===id);assert.equal(bpost.likes,1,'like is idempotent');assert.equal(bpost.liked,true);
 assert.equal((await call({action:'comment',postId:id,nickname:'另一位读者',content:'跨访客评论测试'},bc)).status,200);const ap=(await call(null,a.cookie)).data.posts.find(x=>x.id===id);assert.equal(ap.owned,true);assert.equal(ap.comments.length,1);assert.equal(ap.comments[0].content,'跨访客评论测试');
 await call({action:'unlike',postId:id},bc);assert.equal((await call()).data.posts.find(x=>x.id===id).likes,0);
 await call({action:'hide',postId:id},a.cookie);assert.ok(!(await call()).data.posts.find(x=>x.id===id));await call({action:'restore',postId:id},a.cookie);assert.ok((await call()).data.posts.find(x=>x.id===id));
 assert.equal((await call({action:'publish',nickname:'x',eventId:'invalid',content:'test'})).status,400);
 assert.equal((await call({action:'publish',nickname:'x',eventId:'e01',content:'test',images:['https://invalid.example/image.jpg']})).status,400);
 console.log('PASS: shared visibility, ownership, filtered images, likes, comments, withdrawal and restore.');
}finally{await call({action:'hide',postId:id},a.cookie)}
