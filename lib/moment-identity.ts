export function viewer(req:Request){return req.headers.get('cookie')?.match(/(?:^|;\s*)history_viewer=([a-f0-9-]{36})(?:;|$)/)?.[1]||null;}
export function identity(req:Request){const existing=viewer(req);const author=existing||crypto.randomUUID();return {author,cookie:existing?undefined:`history_viewer=${author}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${new URL(req.url).protocol==='https:'?'; Secure':''}`};}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
