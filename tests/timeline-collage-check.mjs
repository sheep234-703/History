import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={ARCHIVE_VARIANTS:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('public/data.js','utf8')+';this.events=EVENTS',ctx);
const app=fs.readFileSync('public/app.js','utf8');
const chunk=app.slice(app.indexOf('const timelineArt='),app.indexOf('let selectedTimelineEvent='));
const month=app.slice(app.indexOf('function monthDay('),app.indexOf('\nfunction renderEvents('));
vm.runInContext('const years=[...new Set(EVENTS.flatMap(e=>e.years))].sort((a,b)=>a-b);'+month+chunk+';this.entries=timelineEntries;this.art=timelineArt;this.collage=eventCollage;',ctx);
assert.equal(ctx.entries.length,ctx.events.reduce((n,e)=>n+e.years.length,0));
for(const {year,event} of ctx.entries){assert.ok(event.years.includes(year));const html=ctx.collage(event);assert.equal(!!html,!!event.images.length);if(html){assert.ok(html.includes('fragment-'+event.id));for(const other of ctx.events.filter(e=>e.id!==event.id))assert.ok(!html.includes('fragment-'+other.id));const key=ctx.art[event.id];if(key){assert.ok(event.images.includes('assets/'+key+'.jpg'));assert.ok(fs.existsSync('public/assets/timeline/'+key+'.webp'));}}}
assert.equal(ctx.entries.filter(n=>n.year===1911).length,3);assert.equal(ctx.entries.filter(n=>n.year===1927).length,3);
assert.ok(app.includes('showEvent(item.dataset.timelineEvent)'));assert.ok(app.includes('timeline-event-title">${esc(e.title)}'));
assert.ok(app.includes('timeline.innerHTML=years.map'));assert.ok(app.includes('timeline-year-events'));console.log('PASS: one node per year; events retain separate source-matched rows and titles.');
