import json,re
from pathlib import Path
import argparse
parser=argparse.ArgumentParser(description='Build the Keys 2GIS theme from an official style JSON response')
parser.add_argument('source',help='Path to the downloaded base style JSON response')
args=parser.parse_args()
r=json.loads(Path(args.source).read_text())['result']
palette={'land':'#F4F3FA','block':'#ECEBF3','water':'#D6E3F3','green':'#DDEAE4','building':'#DEDEE9','outline':'#CBCDDC','road':'#FFFFFF','roadEdge':'#D9D9E6','text':'#555B70','secondary':'#747A8F'}
supported={'polygon','line','dashedLine','point','labelLine','group'}
def convert(l,parent=''):
 name=l.get('name','');context=(parent+' '+name).lower();typ=l['type']
 if typ not in supported:return None
 if typ=='group':
  if any(x in name.lower() for x in ['traffic','immersive','floor','hillshade','3d','dammam','neom','parking lots layer']):return None
  children=[a for c in l.get('layers',[]) if (a:=convert(c,context))]
  return {'id':l['id'],'type':'group','name':name,'layers':children} if children else None
 st=l.get('style',{}).copy()
 # Keep public-transport landmarks. Delay the remaining small POIs to close zooms.
 if parent.strip().lower() in ['poi icons new','non-unique icons poi']:
  if not re.search('airport|railway station|bus terminal|port|museum|theater|sights|park|beach',name,re.I):return None
  l['minzoom']=max(l.get('minzoom',0),15)
 if typ=='polygon':
  color=palette['block']
  if re.search('water|river|lake|ocean|sea|background with texture',context):color=palette['water']
  elif re.search('forest|park|vegetation|grass|garden|green|wood',context):color=palette['green']
  elif 'building' in context:color=palette['building']
  elif re.search('country|region|bridge area|pier area',context):color=palette['land']
  st['color']=color
  if 'strokeColor' in st:st['strokeColor']=palette['outline'] if 'building' in context else color
  for k in list(st):
   if k.startswith('texture'):del st[k]
 elif typ in ['line','dashedLine']:
  if re.search('water|river|canal|stream',context):st['color']=palette['water']
  elif re.search('road|tunnel',context):st['color']=palette['roadEdge'] if re.search('background|border|outline',context) else palette['road']
  elif not re.search('transport|metro|railway',context):st['color']=palette['outline']
 if typ in ['point','labelLine'] and 'textColor' in st:
  st['textColor']=palette['text']
  if 'textHaloColor' in st:st['textHaloColor']='#FFFFFF'
  if 'textStrokeColor' in st:st['textStrokeColor']='#FFFFFF'
 out={k:v for k,v in l.items() if k not in ['metadata','style','layers']}
 out['style']=st
 return out
layers=[a for l in r['layers'] if (a:=convert(l))]
result={'version':1,'name':'Ключи — светлая карта','background':{'color':palette['land']},'icons':r['icons'],'iconBaseUrl':r['iconBaseUrl'],'layers':layers,'metadata':{'sourceStyle':'c080bb6a-8134-4993-93a1-5b4d8c36a59b','reviewedAt':'2026-11-02','palette':palette},'graphicsPresets':r['graphicsPresets']}
Path('app/public/maps/keys-light.json').write_text(json.dumps({'meta':{'code':200},'result':result},ensure_ascii=False,separators=(',',':'))+'\n')
print('theme bytes',Path('app/public/maps/keys-light.json').stat().st_size)
