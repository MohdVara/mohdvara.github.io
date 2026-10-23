import {createHash} from 'node:crypto';
export const hash=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
export function compilePack(source,profile,catalog,metadata){
 const locale=profile.locale,entries=source.entries.filter(e=>e.visible),issues=[];
 const tokens=entries.map(e=>{
  const value=catalog[e.key],meta=metadata[e.key];
  if(typeof value!=='string'||!value.trim())issues.push({key:e.key,status:'missing'});
  else if(locale!=='en'&&meta?.sourceHash!==hash(e.source))issues.push({key:e.key,status:'stale',protected:meta?.status==='human_reviewed'});
  return {id:e.id,text:value||'',role:e.role,weight:e.weight,regionIds:e.regions};
 });
 const complex=['arabic','hindi','tamil'].includes(profile.artwork.fontId),font=profile.artwork.fontId;
 return {issues,pack:{schema:'NAAE/text-pack/1',locale,script:font==='arabic'?'Arabic':font==='hindi'?'Devanagari':font==='tamil'?'Tamil':font==='japanese'?'Japanese':font==='chinese'?'Han':'Latin',direction:profile.direction,writingModes:profile.writingModes.map(m=>m==='vertical'?'vertical-rl':'horizontal-tb'),preferredFont:font,fallbackFonts:font==='latin'?[]:['latin'],strategies:['words','phrases'],characters:[],densityMarks:['.',':','+','*','/','\\','|','~'],tokens,densityPreference:source.density,metrics:{lineHeight:profile.artwork.lineHeight,trackingSafe:!complex},sourceRevision:hash([source,entries.map(e=>[e.key,catalog[e.key],metadata[e.key]]),profile.artwork]),reviewStatus:'machine-authored-unreviewed'}};
}
