const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 for (const w of [1440,768,390]){
  const p=await b.newPage({viewport:{width:w,height:w<500?844:900}});
  const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.goto('http://localhost:8765/index.html',{waitUntil:'load'});
  await p.addStyleTag({content:'*{transition:none!important;animation:none!important}.rv{opacity:1!important;transform:none!important}'});
  await p.waitForTimeout(2500);
  const r=await p.evaluate(()=>{
    const out={};
    out.ovf=document.documentElement.scrollWidth-innerWidth;
    out.wide=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('.gtrack,.leaflet-container,.estela,svg')}).slice(0,6).map(e=>e.tagName+'.'+e.className);
    out.gals=[...document.querySelectorAll('.gal')].map(g=>[!!g.querySelector('.gnext'),g.querySelectorAll('.gdots button').length,g.querySelectorAll('.gslide').length]);
    out.leaflet=!!document.querySelector('.leaflet-container .leaflet-marker-icon');
    out.tiles=document.querySelectorAll('.leaflet-tile-loaded').length;
    out.secs=[...document.querySelectorAll('main>section')].map(s=>{const h=s.outerHTML;return s.id+':'+((h.match(/<div[\s>]/g)||[]).length-(h.match(/<\/div>/g)||[]).length)}).join(' ');
    return out;});
  console.log(w,JSON.stringify(r),errs.slice(0,5));
  await p.screenshot({path:`./full_${w}.png`,fullPage:true});
  await p.close();
 }
 await b.close();})();
