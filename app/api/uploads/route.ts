import { env } from 'cloudflare:workers';
import { identity, sameOrigin } from '../../../lib/moment-identity';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200,cookie?:string)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'请求来源无效'},403);
 if(!env.BUCKET||!env.DB)return json({error:'图片共享服务暂不可用'},503);
 if(Number(req.headers.get('content-length')||0)>4_300_000)return json({error:'图片过大，请选择较小的图片'},413);
 try{
  const form=await req.formData(),file=form.get('image');
  if(!file||typeof file==='string'||!('arrayBuffer' in file))return json({error:'请选择图片'},400);
  if(file.size>4_000_000||file.size<12)return json({error:'图片大小无效，每张最多4MB'},400);
  const bytes=new Uint8Array(await file.arrayBuffer());let mime='';
  if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';
  if([137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x))mime='image/png';
  if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')mime='image/webp';
  if(!mime||mime!==file.type)return json({error:'仅支持有效的 JPG、PNG、WebP 图片'},400);
  const {author,cookie}=identity(req),now=Date.now();
  const rate=await env.DB.prepare('SELECT COUNT(*) AS n FROM moment_uploads WHERE author=? AND created_at>?').bind(author,now-3600000).first();
  if(Number(rate?.n)>79)return json({error:'图片上传较频繁，请稍后再试'},429,cookie);
  const key=crypto.randomUUID();
  await env.BUCKET.put('moments/'+key,bytes,{httpMetadata:{contentType:mime,cacheControl:'public, max-age=31536000, immutable'}});
  await env.DB.prepare('INSERT INTO moment_uploads (key,author,mime,size,created_at) VALUES (?,?,?,?,?)').bind(key,author,mime,file.size,now).run();
  return json({image:'api/media/'+key},200,cookie);
 }catch{return json({error:'图片上传未完成，请稍后重试'},400)}
}
