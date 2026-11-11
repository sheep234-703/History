/* Color separation only: the unchanged archive supplies every background pixel. */
function rolePixelRegion(width,height,region=[0,0,1,1]){return [Math.max(0,Math.floor(region[0]*width)),Math.max(0,Math.floor(region[1]*height)),Math.min(width,Math.ceil(region[2]*width)),Math.min(height,Math.ceil(region[3]*height))]}
function buildRoleStudyAlpha(pixels,width,height,region){
 const alpha=new Uint8ClampedArray(width*height),[left,top,right,bottom]=rolePixelRegion(width,height,region);let seeds=0;
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const k=(y*width+x)*4,r=pixels[k],g=pixels[k+1],b=pixels[k+2],high=Math.max(r,g,b),low=Math.min(r,g,b),chroma=high-low;if(chroma>14&&chroma/Math.max(1,high)>.17){alpha[y*width+x]=Math.min(255,Math.round((chroma-14)*32));seeds++}}
 if(seeds>(right-left)*(bottom-top)*.65)throw Error('人物图的轮廓分离失败，请稍后重试');
 const seedsOnly=alpha.slice();
 // Extend solely into adjacent dark printed outlines, never into the paper.
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const pos=y*width+x,k=pos*4;if(alpha[pos]||Math.max(pixels[k],pixels[k+1],pixels[k+2])>105)continue;let found=false;for(let dy=-2;dy<=2&&!found;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx>=left&&nx<right&&ny>=top&&ny<bottom&&seedsOnly[ny*width+nx]>96){found=true;break}}if(found)alpha[pos]=255}
 return alpha;
}
function buildProvidedRoleAlpha(pixels,base,width,height,region){
 const alpha=new Uint8ClampedArray(width*height),[left,top,right,bottom]=rolePixelRegion(width,height,region);
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const pos=y*width+x,k=pos*4,r=pixels[k],g=pixels[k+1],b=pixels[k+2],br=base[k],bg=base[k+1],bb=base[k+2],distance=Math.hypot(r-br,g-bg,b-bb);if(distance<35)continue;const dark=Math.max(r,g,b)<110,blueGreen=(b>r*.85&&b>g*.65)||(g>r*.9&&g>b*1.2),filled=bg>100&&g<bg-32,skin=r>135&&g>85&&b<bb-24;if(dark||blueGreen||filled||skin)alpha[pos]=Math.min(255,Math.round((distance-30)*12))}
 return alpha;
}
