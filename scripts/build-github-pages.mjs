import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

// GitHub Pages hosts this export; the original Worker application is unchanged.
const base = process.env.PAGES_BASE_PATH || '/History/';
if (!/^\/[A-Za-z0-9_/-]*\/$/.test(base)) throw new Error('Invalid Pages base path');
const out = 'pages-dist';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp('public', out, { recursive: true });
let html = await readFile('site.html', 'utf8');
html = html.replace(/<button class="scope-tab active" data-scope="public">[\s\S]*?<\/button>/, '')
  .replace('class="scope-tab" data-scope="local"', 'class="scope-tab active" data-scope="local"')
  .replace('<option value="public">公开</option>', '')
  .replace(/<p><b>公共广场：<\/b>[\s\S]*?<\/p>/, '<p><b>GitHub Pages 版：</b>可浏览全部历史内容并保存个人朋友圈练习。此版本为静态网站，不提供跨访客共享、公开发布或共享评论。</p>')
  .replace(/<p>公开动态的撤下权限[\s\S]*?<\/p>/, '<p>个人练习保存在当前浏览器。清除浏览器数据会清除这些内容。情境创作不等于历史证言。</p>')
  .replace('04 决定公开或仅自己可见', '04 保存在当前浏览器')
  .replace('<span id="storageTitle">公共广场</span>', '<span id="storageTitle">仅自己可见</span>');
await writeFile(path.join(out, 'index.html'), html);
let app = await readFile(path.join(out, 'app.js'), 'utf8');
app = app.replaceAll("scope='public'", "scope='local'")
  .replaceAll("setScope('public')", "setScope('local')")
  .replace("renderEvents();route();", "renderEvents();setScope('local');route();")
  .replace("form.elements.visibility.value=draft.visibility==='public'?'public':'local'", "form.elements.visibility.value='local'");
const apiStart = app.indexOf('async function api(payload)');
const apiEnd = app.indexOf("$('#collage')", apiStart);
if (apiStart < 0 || apiEnd < 0) throw new Error('App API boundary changed; review static export');
app = app.slice(0, apiStart) + "async function api(){throw Error('GitHub Pages 版仅支持当前浏览器保存，不支持共享发布')}\n" + app.slice(apiEnd);
await writeFile(path.join(out, 'app.js'), app);
async function rewrite(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) await rewrite(filename);
    else if (/\.(html|css|js|json)$/.test(entry.name)) {
      let text = await readFile(filename, 'utf8');
      // Include URLs assembled in templates, plus CSS url(/...) values.
      text = text.replace(/(["'`])\/(?!\/)/g, (_, quote) => quote + base)
        .replace(/url\(\/(?!\/)/g, 'url(' + base);
      await writeFile(filename, text);
    }
  }
}
await rewrite(out);
await writeFile(path.join(out, '.nojekyll'), '');
console.log('GitHub Pages export ready at ' + out + ', base ' + base);
