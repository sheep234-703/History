import { env } from 'cloudflare:workers';
export async function GET(req:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;
 if(!/^[a-f0-9-]{36}$/.test(key))return new Response('Not found',{status:404});
 if(!env.BUCKET||!env.DB)return new Response('Image service unavailable',{status:503});
 // Unpublished uploads are not exposed. Published images stay available while a post references them.
 const published=await env.DB.prepare("SELECT 1 AS yes FROM moment_posts WHERE hidden=0 AND images LIKE ? LIMIT 1").bind('%api/media/'+key+'%').first();
 if(!published)return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
 const object=await env.BUCKET.get('moments/'+key);if(!object)return new Response('Not found',{status:404});
 return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'image/jpeg','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
}
