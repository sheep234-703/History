from docx import Document
from pathlib import Path
from PIL import Image
from io import BytesIO
import json,re
root=Path('/workspace/sites/history-moments/public')
d=Document('/workspace/scratch/da62039727d2/upload/纪念日整合.docx')
starts=[i for i,p in enumerate(d.paragraphs) if p.text.startswith('事件时间：')]
years=[[1923],[1926],[1927],[],[1928],[1919],[1925],[1927],[1927],[1932],[1915],[1915],[1915],[1937],[1937],[1931],[1911],[1921],[1911],[1936],[1924],[1883],[1932],[1886,1889],[1895],[1917],[],[1910,1911],[],[]]
loc=['京汉铁路沿线','北京','上海','多地，依具体活动而定','济南','北京及全国多地','上海及全国多地','南昌','广州','上海闸北','待据原始史料核实','待据原始史料核实','待据原始史料核实','卢沟桥','上海','柳条湖、北大营','广州黄花岗','广州','武昌','西安','莫斯科附近哥尔克村','伦敦','待据原始史料核实','芝加哥；节日设立地点待补','伦敦','彼得格勒','待核实','多国，依具体节点而定','待核实','待核实']
items=[]
for n,s in enumerate(starts):
 title=next(p.text.strip() for p in reversed(d.paragraphs[:s]) if p.text.strip())
 end=starts[n+1]-1 if n+1<len(starts) else len(d.paragraphs)
 fields={};images=[];notes=[]
 for p in d.paragraphs[s:end]:
  t=p.text.strip()
  if '：' in t and t.split('：')[0] in ['事件时间','纪念日时间','对应画报的史料出版时间','出版的报社','事件详情']:
   k,v=t.split('：',1);fields[k]=v
  elif t and ('不明' in t or '不确定' in t):notes.append(t)
  for b in p._p.xpath('.//a:blip'):
   rid=b.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
   if not rid:continue
   try:
    im=Image.open(BytesIO(d.part.related_parts[rid].blob)).convert('RGB');im.thumbnail((1400,1800));name=f'assets/e{n+1}-{len(images)+1}.jpg';im.save(root/name,quality=85);images.append(name)
   except Exception:pass
 items.append(dict(id=f'e{n+1:02}',title=title,years=years[n],location=loc[n],fields=fields,images=images,notes=notes))
(root/'data.js').write_text('const EVENTS = '+json.dumps(items,ensure_ascii=False)+';',encoding='utf8')
print('Events:',len(items),'Images:',sum(len(i['images']) for i in items))
