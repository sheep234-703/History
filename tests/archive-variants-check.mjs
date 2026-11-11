import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('public/data.js','utf8')+fs.readFileSync('public/archive-variants.js','utf8')+';this.events=EVENTS;this.variants=ARCHIVE_VARIANTS;',c);
const allowed=JSON.parse(fs.readFileSync('db/events.json'));
assert.equal(c.events.length,30);assert.equal(Object.keys(c.variants).length,35);
for(const [original,v] of Object.entries(c.variants)){assert.ok(fs.existsSync('public/'+original),original);assert.ok(fs.existsSync('public/'+v.red),v.red);assert.notEqual(original,v.red);}
for(const e of c.events)for(const path of e.images){assert.ok(allowed[e.id].includes(path),'publishing allowlist: '+path);assert.ok(fs.existsSync('public/'+path),path);}
const h=c.events.find(e=>e.id==='e10');assert.equal(h.archiveRecords[0].fileId,'B02030128700');assert.equal(h.archiveRecords[0].created,'1932年9月7日');assert.ok(h.archiveOriginals.includes('assets/e10-huxi-27.png'));assert.ok(c.events.find(e=>e.id==='e09').images.includes('assets/e09-guangzhou-leaflet.jpg'));
console.log('PASS: 35 black/white sources paired; original assets, archive metadata and publishing allowlist verified.');
