"""Explicit maintenance step; requires fontTools[woff], no network or provider calls."""
import json,hashlib,pathlib,sys
from fontTools import subset
from fontTools.ttLib import TTFont
source=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '../portfolio-inspired-ascii-art/public/fonts/unicode')
registry=json.load(open('src/i18n/languages.json'));vocabulary=json.load(open('src/artwork/vocabulary.json'))
original={r['id']:r for r in json.load(open(source/'manifest.json'))};target=pathlib.Path('public/fonts/unicode');target.mkdir(parents=True,exist_ok=True)
texts={r['artwork']['fontId']:'' for r in registry}
for r in registry:
 catalog=json.load(open('src/i18n/locales/'+r['locale']+'.json'));texts[r['artwork']['fontId']]+=''.join(catalog[e['key']] for e in vocabulary['entries'])
manifest=[]
for id,text in texts.items():
 record=original[id];data=(source/record['file']).read_bytes();assert hashlib.sha256(data).hexdigest()==record['sha256']
 options=subset.Options();options.flavor='woff2';options.layout_features=['*'];options.name_IDs=['*'];options.recalc_timestamp=False
 font=subset.load_font(str(source/record['file']),options);sub=subset.Subsetter(options=options)
 sub.populate(text=text+''.join(chr(c) for c in range(32,127)));sub.subset(font);subset.save_font(font,str(target/record['file']),options)
 loaded=TTFont(target/record['file']);points=sorted(set().union(*(set(t.cmap) for t in loaded['cmap'].tables if t.isUnicode())));coverage=[]
 for cp in points:
  if coverage and coverage[-1][1]+1==cp:coverage[-1][1]=cp
  else:coverage.append([cp,cp])
 data=(target/record['file']).read_bytes();(target/record['license']).write_bytes((source/record['license']).read_bytes())
 manifest.append({**record,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'coverage':coverage,'upstreamSha256':record['sha256'],'subset':'PME semantic vocabulary + ASCII; OpenType shaping retained'})
(target/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print({r['id']:r['bytes'] for r in manifest})
