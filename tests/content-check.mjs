import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const events=vm.runInNewContext(readFileSync('public/data.js','utf8')+';EVENTS');
const map=JSON.parse(readFileSync('content/event-sources.json','utf8'));
assert.equal(events.length,30);assert.equal(new Set(events.map(e=>e.id)).size,30);assert.equal(map.length,30);
for(const e of events){
 assert.ok(e.fields['事件时间'],e.id+' missing time');
 assert.ok(e.fields['事件详情'].length>20,e.id+' missing details');
 assert.ok(e.summary&&e.summary.length<=120,e.id+' missing short card summary');
 assert.ok(e.locationDetails.length,e.id+' missing places');
 assert.ok(e.locationSourceNotes.length,e.id+' missing location references');
 assert.equal(e.contentDocuments.join('|'),'纪念日事件（详细版）|纪念日 地点');
 const source=map.find(x=>x.event_id===e.id);assert.ok(source,e.id+' source map missing');
 for(const image of e.images)assert.ok(existsSync('public/'+image),image+' missing');
}
assert.ok(events.find(e=>e.id==='e11').fields['事件时间'].startsWith('1915年5月7日'));
assert.ok(events.find(e=>e.id==='e12').fields['事件时间'].startsWith('1915年5月9日'));
assert.ok(events.find(e=>e.id==='e27').fields['事件时间'].startsWith('2月25日'));
assert.ok(events.find(e=>e.id==='e30').fields['事件时间'].startsWith('3月25日'));
assert.ok(events.find(e=>e.id==='e21').detailNotes.some(n=>n.includes('不作为')));
assert.ok(events.find(e=>e.id==='e22').detailNotes.some(n=>n.includes('不作为')));
assert.ok(events.find(e=>e.id==='e29').detailNotes.some(n=>n.includes('未完全核实')));
console.log('PASS: all 30 events have detailed times, stories, context-specific places, source attribution and preserved archive assets.');
