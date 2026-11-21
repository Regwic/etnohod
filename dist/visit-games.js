/* Chapter minigames. State is stored inside the active profile's story object. */
function visitGameError(u,game,reason){
 if(typeof visitRecord==='function'){visitRecord(u,'error',{topic:game==='patterns'?'pattern':game,reason});return}
 u.analytics=u.analytics&&typeof u.analytics==='object'?u.analytics:{};
 u.analytics.errors=u.analytics.errors&&typeof u.analytics.errors==='object'&&!Array.isArray(u.analytics.errors)?u.analytics.errors:{};
 u.analytics.errors[game]=(Number(u.analytics.errors[game])||0)+1;
 if(!Array.isArray(u.analytics.events))u.analytics.events=[];
 u.analytics.events.push({type:'error',game,reason,at:new Date().toISOString()});
 if(u.analytics.events.length>300)u.analytics.events.splice(0,u.analytics.events.length-300);
}
function visitFoodArt(id,phase=4){
 const done=phase>=4,chak=id==='chakchak',tuk=id==='tukmach';
 const pieces=Array.from({length:chak?22:10},(_,i)=>{const x=27+(i*17)%70,y=done?55+(i*13)%24:58+(i*11)%23;return chak?`<rect x="${x}" y="${y}" width="13" height="6" rx="3" fill="${i%2?'#d99c45':'#edc06b'}" transform="rotate(${i%3*20-20} ${x} ${y})"/>`:`<path d="M${x} ${y}q8-5 15 0t13 0" fill="none" stroke="${tuk?'#e9ca7b':'#d0a87a'}" stroke-width="${tuk?3:7}" stroke-linecap="round"/>`}).join('');
 return `<svg class="visit-food-art" viewBox="0 0 130 110" role="img" aria-label="${done?'Готовое блюдо':phase===0?'Ингредиенты для блюда':'Блюдо готовится'}"><ellipse cx="65" cy="93" rx="49" ry="8" fill="#566b3b" opacity=".12"/><path d="M16 68Q20 99 65 99t49-31Z" fill="#80a08a" stroke="#557862" stroke-width="2"/><ellipse cx="65" cy="68" rx="49" ry="19" fill="#f5dfb2" stroke="#557862" stroke-width="2"/>${phase===0?'<ellipse cx="65" cy="68" rx="23" ry="13" fill="#ebd8ac"/><path d="M50 65q12-7 27 0" fill="none" stroke="#c8ad79" stroke-width="2"/>':pieces}${phase>=2&&phase<4?'<g fill="none" stroke="#a3b3a0" stroke-width="3" stroke-linecap="round"><path d="M45 39q-8-8 0-16"/><path d="M65 35q-8-9 0-18"/><path d="M85 39q-8-8 0-16"/></g>':''}${done?'<path d="M90 49l6 5 8-12" fill="none" stroke="#75914f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>':''}</svg>`;
}
function visitPatternCostume(which,ribbons,motif){
 const stitched=motif?.target.map((filled,i)=>filled?`<rect x="${77+(i%8)*2}" y="${143+Math.floor(i/8)*2}" width="2" height="2" fill="#743f2d"/>`:'').join('')||'';
 const count=Math.min(3,Math.max(0,ribbons-which*3)),color=which===0?'#7a9e85':'#be8b7d',pattern='v-ribbon-'+which;return `<svg class="visit-costume" viewBox="0 0 170 220" role="img" aria-label="Наряд ${which+1}: ${count} из трёх узорных полос"><defs><pattern id="${pattern}" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M8 1l6 7-6 7-6-7Z" fill="none" stroke="#965e43" stroke-width="2"/><circle cx="8" cy="8" r="1.7" fill="#965e43"/></pattern></defs><path d="M56 43L31 66 14 112l24 9 20-37v113h54V84l20 37 24-9-17-46-25-23Z" fill="${color}" stroke="#5c755e" stroke-width="2"/><path d="M61 46l24 30 24-30" fill="#f3ddb2" stroke="#b89b68" stroke-width="2"/>${[0,1,2].map(i=>`<path d="M58 ${113+i*27}h54v20H58Z" fill="${motif&&i===1?'#f6db9f':count>i?'url(#'+pattern+')':'#ffffff2b'}" stroke="${count>i?'#e1bb76':'#ffffff55'}" stroke-width="2"/>`).join('')}${stitched}<circle cx="85" cy="23" r="19" fill="#e7bd9d"/><path d="M65 16q20-25 40 0" fill="#72533e"/><path d="M66 198v15h14v-15m10 0v15h14v-15" fill="#687f80"/></svg>`}
