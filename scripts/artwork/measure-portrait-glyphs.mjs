// Development-only calibration. Normal builds consume the checked-in metrics.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const source=readFileSync('assets/source/MohdVaraLetters.svg','utf8');
const data=source.match(/src:url\((data:[^)]+)\)/)?.[1];if(!data)throw Error('Embedded portrait font missing');
const characters=[...new Set([...source.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]))].sort();
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');const browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage();
const glyphs=await page.evaluate(async({data,characters})=>{
 const face=new FontFace('PortraitProbe',`url(${data})`);await face.load();document.fonts.add(face);
 const result={};
 for(const character of characters){const variants=[];
 for(const [id,sx,sy] of [['normal',1,1],['vertical',.9,1.05],['horizontal',1,.9]]){
 const canvas=document.createElement('canvas');canvas.width=80;canvas.height=80;const c=canvas.getContext('2d',{willReadFrequently:true});
 c.translate(40,40);c.scale(sx,sy);c.font='700 32px PortraitProbe';c.textAlign='center';c.textBaseline='middle';c.fillText(character,0,0);
 const a=c.getImageData(0,0,80,80).data;let ink=0,mx=0,my=0,gx=0,gy=0;
 for(let y=1;y<79;y++)for(let x=1;x<79;x++){const v=a[(y*80+x)*4+3]/255;ink+=v;mx+=x*v;my+=y*v;gx+=((a[(y*80+x+1)*4+3]-a[(y*80+x-1)*4+3])/255)**2;gy+=((a[((y+1)*80+x)*4+3]-a[((y-1)*80+x)*4+3])/255)**2;}
 const m=c.measureText(character);variants.push({id,sx,sy,advance:m.width/32,inkBounds:[m.actualBoundingBoxLeft/32,m.actualBoundingBoxAscent/32,m.actualBoundingBoxRight/32,m.actualBoundingBoxDescent/32],coverage:ink/(32*32),centroid:[mx/ink/80,my/ink/80],verticalEdge:gx/(gx+gy||1)});
 }
 result[character]=variants;
 }
 return result;
},{data,characters});
writeFileSync('scripts/artwork/portrait-glyph-metrics.json',JSON.stringify({version:1,fontSha256:createHash('sha256').update(Buffer.from(data.split(',')[1],'base64')).digest('hex'),fontWeight:700,probeSize:32,glyphs},null,2)+'\n');console.log(`Measured ${characters.length} authored glyphs × three shape-preserving variants.`);
}finally{await browser.close();}
