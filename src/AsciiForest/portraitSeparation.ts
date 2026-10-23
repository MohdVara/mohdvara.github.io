import geometry from './portraitGeometry.json';
export type PortraitBounds = { x: number; y: number; width: number; height: number };
export const portraitSeparationPreset = Object.freeze({strength: 0.68, falloff: 0.065, luminance: 0});
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
/** Signed-distance envelope in CSS pixels; no visible silhouette is painted. */
export function portraitWeight(x: number, y: number, box: PortraitBounds, falloff = portraitSeparationPreset.falloff): number {
  if (![x,y,box.x,box.y,box.width,box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) return 0;
  const reach = box.width * clamp(Number.isFinite(falloff) ? falloff : portraitSeparationPreset.falloff, 0.01, 0.15);
  if (x < box.x-reach || x > box.x+box.width+reach || y < box.y-reach || y > box.y+box.height+reach) return 0;
  const px=x-box.x, py=y-box.y;
  let inside=false, distance=Infinity;
  for(let i=0,j=geometry.points.length-1;i<geometry.points.length;j=i++) {
    const a=geometry.points[j],b=geometry.points[i];
    const ax=a[0]*box.width,ay=a[1]*box.height,bx=b[0]*box.width,by=b[1]*box.height;
    if ((ay>py)!==(by>py) && px<(bx-ax)*(py-ay)/(by-ay)+ax) inside=!inside;
    const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);
    distance=Math.min(distance,Math.hypot(px-ax-t*dx,py-ay-t*dy));
  }
  // A soft transition on both sides avoids an erased-looking contour.
  const t=clamp(0.5+(inside?distance:-distance)/(2*reach),0,1);
  const smooth=t*t*(3-2*t);
  const hair=0.65+0.35*clamp((py/box.height-0.18)/0.25,0,1);
  const shoulder=clamp((0.97-py/box.height)/0.16,0,1);
  return smooth*hair*shoulder;
}
export function portraitInkAlpha(ink: string, weight: number, strength: number = portraitSeparationPreset.strength): number {
  const rgb=/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(ink);
  if(!rgb) return 1;
  const [r,g,b]=rgb.slice(1).map(v=>parseInt(v,16));
  // Eligible muted vegetation only; amber, blue, neutral and portrait inks stay intact.
  if(g<r*0.85 || g<b*1.05 || Math.max(r,g,b)-Math.min(r,g,b)<8 || g===0) return 1;
  return 1-clamp(Number.isFinite(strength)?strength:portraitSeparationPreset.strength,0,0.85)*clamp(Number.isFinite(weight)?weight:0,0,1);
}

/** Contrast-luminance alternative for controlled comparisons, cached with glyph ink.
 * Converge toward the scene paper in light mode instead of darkening green ink.
 */
export function portraitInkLuminance(ink: string, weight: number, theme: 'dark' | 'light', amount: number = portraitSeparationPreset.luminance): string {
  const bounded = clamp(Number.isFinite(amount) ? amount : portraitSeparationPreset.luminance, 0, 0.25);
  if (!bounded || portraitInkAlpha(ink, weight, 1) === 1) return ink;
  const rgb = [1,3,5].map(i => parseInt(ink.slice(i,i+2),16));
  const background = theme === 'light' ? [250,248,242] : [16,17,16];
  const mix = bounded * clamp(Number.isFinite(weight) ? weight : 0, 0, 1);
  return '#' + rgb.map((value,i) => Math.round(value+(background[i]-value)*mix).toString(16).padStart(2,'0')).join('');
}

/** Optional light-only environmental de-emphasis using the same silhouette field. */
export function portraitLightForestInk(ink: string, weight: number, theme: 'dark' | 'light', amount: number): string {
  if(theme !== 'light' || portraitInkAlpha(ink,weight,1) === 1) return ink;
  const mix=clamp(Number.isFinite(amount)?amount:0,0,.25)*clamp(Number.isFinite(weight)?weight:0,0,1);
  if(!mix) return ink;
  const rgb=[1,3,5].map(i=>parseInt(ink.slice(i,i+2),16));
  // Light, low-chroma sage/olive-grey. This affects the environmental ink only.
  return '#'+rgb.map((v,i)=>Math.round(v+([180,181,164][i]-v)*mix).toString(16).padStart(2,'0')).join('');
}
