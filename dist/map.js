/* Geographic data: github.com/freOn1131/RuGeo. Preprojected Albers equal-area. */
(() => {
  let geography;
  const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.renderRussiaMap = async function renderRussiaMap(container, onSelect = () => {}) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    container.innerHTML = '<p class="map-instructions" role="status">Раскрываем атлас…</p>';
    if (!document.querySelector('#ethno-map-styles')) {
      const style = document.createElement('style'); style.id = 'ethno-map-styles';
      style.textContent = `.atlas-map{position:relative;isolation:isolate;overflow:hidden;min-width:0}.atlas-map .russia-svg{width:100%;height:auto;display:block;touch-action:none;user-select:none;cursor:grab;min-height:240px;outline-offset:-5px}.atlas-map .russia-svg:active{cursor:grabbing}.atlas-map .russia-svg:focus-visible{outline:2px solid #ae8b48}.atlas-map .map-path{fill:var(--region-fill,#c5c7a2);stroke:#f6eed7;stroke-width:1.1;vector-effect:non-scaling-stroke;transition:fill .2s,stroke .2s;cursor:pointer}.atlas-map .map-path:hover,.atlas-map .map-path.is-selected{fill:#aabc87;stroke:#6a794d;stroke-width:1.6}.atlas-map .map-path.is-available{fill:#d7b968;stroke:#9c753c;stroke-width:1.6}.atlas-map .map-path.is-available:hover,.atlas-map .map-path.is-available.is-selected{fill:#e6c776;stroke:#83612b}.atlas-map .map-location{cursor:pointer;outline:none}.atlas-map .map-location .pin-core{fill:#f5edd5;stroke:#7a895f;stroke-width:1.5}.atlas-map .map-location.available .pin-core{fill:#e4bc60;stroke:#806236;stroke-width:1.6}.atlas-map .map-location .pin-ring{fill:none;stroke:#f9f2d8;stroke-width:1.2;opacity:.8}.atlas-map .map-location .pin-shadow{fill:#4b5937;opacity:.18}.atlas-map .map-location .pin-halo{fill:none;stroke:#b29248;stroke-dasharray:2 4;stroke-width:1;opacity:.6}.atlas-map .map-location:focus-visible .pin-core,.atlas-map .map-location:hover .pin-core,.atlas-map .map-location.is-selected .pin-core{stroke:#925c31;stroke-width:3;fill:#efcd7d}.atlas-map .map-location .pin-icon{fill:none;stroke:#70805b;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.atlas-map .map-location.available .pin-icon{stroke:#624924;fill:#fff1bf}.atlas-map .map-location text{font:600 12px Manrope,system-ui,sans-serif;fill:#3e5039;paint-order:stroke;stroke:#f7f0db;stroke-width:4px;stroke-linejoin:round;pointer-events:none}.atlas-map .map-location.available text{font-size:13px;font-weight:800;fill:#5b4328}.atlas-map .map-location line{stroke:#8c8259;stroke-width:.9;pointer-events:none}.atlas-map .map-toolbar{display:flex;align-items:center;gap:6px;position:absolute;left:20px;bottom:20px;z-index:2}.atlas-map .map-toolbar button{width:44px;height:44px;padding:0!important;border:1px solid #c6bc94!important;background:#fff8e8!important;color:#485e3f!important;border-radius:12px!important;margin:0!important;font:22px Georgia,serif!important;box-shadow:0 3px 0 #bdb89540}.atlas-map .map-toolbar button:hover{background:#eedca7!important}.atlas-map .map-toolbar select{font:600 12px Manrope,system-ui!important;background:#fff8e8!important;color:#485e3f!important;border:1px solid #c6bc94!important;border-radius:12px!important;width:190px!important;margin:0 0 0 8px!important;height:44px;padding:0 12px!important}.atlas-map .map-instructions{font:11px/1.5 Manrope,system-ui!important;color:#77745c!important;margin:0!important;padding:0 20px 14px!important;max-width:none!important}.atlas-map .map-hover{position:absolute;top:18px;left:20px;font:600 11px Manrope,system-ui;color:#586b4d;pointer-events:none;background:#fff7e7d9;padding:7px 12px;border:1px solid #c6c8a480;border-radius:20px}.atlas-map .map-controls{display:contents}.atlas-map .map-decoration{pointer-events:none;opacity:.45}@media(max-width:600px){.atlas-map{display:flex;flex-direction:column;min-height:340px}.atlas-map .russia-svg{min-height:0!important;height:auto!important;flex:1 1 0;max-height:none}.atlas-map .map-toolbar{position:relative;left:auto;bottom:auto;flex:0 0 auto;padding:4px 12px 12px;flex-wrap:wrap}.atlas-map .map-toolbar select{width:160px!important}.atlas-map .map-instructions{padding:12px!important}.atlas-map .map-hover{top:7px;left:12px;font-size:10px;padding:5px 9px}.atlas-map .map-location text{font-weight:700}.atlas-map .map-decoration{opacity:.28}}@media(prefers-reduced-motion:reduce){.atlas-map .map-path{transition:none}}`;
      document.head.append(style);
    }
    try {
      geography = geography || fetch('assets/russia-map.json').then(r => { if (!r.ok) throw Error('map'); return r.json(); }).catch(e => {geography=null;throw e;});
      const data = await geography;
      if (!container.isConnected) return;
      container.classList.add('atlas-map');
      const offsets = {bashkortostan:[27,35], tatarstan:[-91,-23], dagestan:[-62,34], yakutia:[25,8], altai:[23,31], karelia:[-24,-31], kamchatka:[-107,34], crimea:[-47,32]};
      const pins = data.locations.map(p => {
        const [dx,dy]=offsets[p.id]||[25,-25], r=p.available?21:15;
        const symbol=p.available?'<path class="pin-icon" d="M0-13L3.5-4 13 0 3.5 4 0 13-3.5 4-13 0-3.5-4Z"/><circle cx="0" cy="0" r="3" fill="#74552e"/><path d="M0-13L0-3 13 0" fill="#9a7440" opacity=".5"/>':'<path class="pin-icon" d="M-5-1V-5a5 5 0 0 1 10 0v4M-7-1H7V8H-7Z"/><circle cx="0" cy="3" r="1.2" fill="#70805b"/>';
        return `<g class="map-location ${p.available?'available':''}" tabindex="0" role="button" aria-pressed="false" aria-label="${safe(p.name)}: ${p.available?'маршрут доступен':'маршрут готовится'}" data-location="${safe(p.id)}" transform="translate(${p.x} ${p.y})"><title>${safe(p.name)}</title><g class="pin-symbol"><circle class="pin-shadow" cx="0" cy="3" r="${r+1}"/>${p.available?'<circle class="pin-halo" r="27"/>':''}<circle class="pin-core" r="${r}"/><circle class="pin-ring" r="${r-4}"/>${symbol}<circle r="26" fill="transparent"/></g><line x1="${dx<0?-r:r}" y1="${dy<0?-7:7}" x2="${dx}" y2="${dy-4}"/><text x="${dx}" y="${dy}">${safe(p.name)}</text></g>`;
      }).join('');
      const palette=['#a6bd85','#88a97b','#a8bd91','#c8c38a','#7ca68b','#b7ba81','#8bb494'];
      const terrain=`<g class="map-decoration" fill="none" stroke="#71866b" stroke-width="1.4" stroke-linecap="round"><path d="M560 375l11-18 11 18m-17-9l6 3 5-3M585 378l13-25 13 25m-21-15l8 4 6-4M615 375l9-14 9 14"/><path d="M515 245v23m-7-10l7-12 7 12m-14 3l7-12 7 12M533 249v20m-6-10l6-10 6 10m-12 3l6-10 6 10"/><path d="M855 470q8 6 16 0t16 0m-22 8q8 6 16 0t16 0M920 445q8-9 16 0q8-9 16 0M940 455q7-7 14 0q7-7 14 0"/></g>`;
      container.innerHTML = `<div class="map-hover" aria-live="polite">Куда отправимся сегодня?</div><svg class="russia-svg" viewBox="0 0 1100 610" tabindex="0" role="group" aria-label="Интерактивный атлас: выберите регион или отметку маршрута. Масштаб — кнопками плюс и минус, перемещение — стрелками или перетаскиванием."><defs><pattern id="atlas-land-dots" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#dce6cf"/><circle cx="4" cy="4" r="1.75" fill="#42664e"/></pattern><pattern id="map-grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#999471" stroke-width=".4" opacity=".12"/></pattern></defs><rect x="-3000" y="-2000" width="7000" height="5000" fill="url(#map-grid)"/><g class="map-regions">${data.regions.map(r=>`<path class="map-path ${r.id==='bashkortostan'?'is-available':''}" style="--region-fill:${palette[data.regions.indexOf(r)%palette.length]}" d="${r.d}" data-region="${safe(r.id)}"><title>${safe(r.name)}</title></path>`).join('')}</g>${terrain}<g class="map-pins">${pins}</g><g transform="translate(1010 95)" fill="none" stroke="#9a8c61" stroke-width="1"><circle r="27"/><path d="M0-36V36M-36 0H36M0-28L-5 0 0-5 5 0Z"/><text x="0" y="-45" fill="#81764f" stroke="none" text-anchor="middle" font-family="Georgia" font-size="12">С</text></g></svg><div class="map-toolbar" aria-label="Управление картой"><div class="map-controls"><button type="button" data-zoom="in" aria-label="Приблизить карту">+</button><button type="button" data-zoom="out" aria-label="Отдалить карту">−</button><button type="button" data-zoom="reset" aria-label="Показать всю карту">↺</button></div><select aria-label="Выбрать регион на карте"><option value="">Найти регион</option>${data.regions.slice().sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(r=>`<option value="${safe(r.id)}">${safe(r.name)}</option>`).join('')}</select></div>`;
      const svg=container.querySelector('svg'), status=container.querySelector('.map-hover');
      let view=[0,0,1100,610], drag=null, moved=false;
      const pointers=new Map(); let pinch=null;
      const apply=()=>{view[0]=Math.min(1050,Math.max(-view[2]+50,view[0]));view[1]=Math.min(560,Math.max(-view[3]+50,view[1]));svg.setAttribute('viewBox',view.join(' '));};
      const zoom=(factor,cx=view[0]+view[2]/2,cy=view[1]+view[3]/2)=>{const w=Math.min(1100,Math.max(183,view[2]*factor)),ratio=w/view[2];view=[cx-(cx-view[0])*ratio,cy-(cy-view[1])*ratio,w,w*610/1100];apply();};
      const choose=(id,isPin=false)=>{const p=(isPin?data.locations:data.regions).find(r=>r.id===id);if(!p)return;container.querySelectorAll('.is-selected').forEach(el=>{el.classList.remove('is-selected');if(el.hasAttribute('aria-pressed'))el.setAttribute('aria-pressed','false')});container.querySelector(`[${isPin?'data-location':'data-region'}="${id}"]`)?.classList.add('is-selected');if(isPin)container.querySelector(`[data-location="${id}"]`)?.setAttribute('aria-pressed','true');status.textContent=p.name+(p.available||id==='bashkortostan'?' · маршрут открыт':' · маршрут готовится');const matchingRegion=data.regions.find(r=>r.id===p.id||r.name===p.name||r.name===({altai:'Республика Алтай',kamchatka:'Камчатский край'})[p.id]);container.querySelector('select').value=matchingRegion?.id||'';const route = !isPin && data.locations.find(location => location.name === p.name ||
        ({altai:'Республика Алтай',kamchatka:'Камчатский край'})[location.id] === p.name);
      onSelect(route?.id || p.id, route?.name || p.name, !!p.available || id === 'bashkortostan');};
      container.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{if(b.dataset.zoom==='reset'){view=[0,0,1100,610];apply();}else zoom(b.dataset.zoom==='in'?.75:1.333333)});
      container.querySelector('select').onchange=e=>{if(e.target.value)choose(e.target.value)};
      svg.addEventListener('click',e=>{if(moved){moved=false;return}const pin=e.target.closest('[data-location]'),reg=e.target.closest('[data-region]');if(pin)choose(pin.dataset.location,true);else if(reg)choose(reg.dataset.region)});
      svg.addEventListener('pointerover',e=>{const el=e.target.closest('[data-location],[data-region]');if(!el)return;const p=(el.dataset.location?data.locations:data.regions).find(p=>p.id===(el.dataset.location||el.dataset.region));if(p)status.textContent=p.name});
      svg.addEventListener('keydown',e=>{const p=e.target.closest('[data-location]');if(p&&(e.key==='Enter'||e.key===' ')){e.preventDefault();choose(p.dataset.location,true);return}if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='+'||e.key==='=')zoom(.75);else if(e.key==='-')zoom(1.333333);else if(e.key==='0'){view=[0,0,1100,610];apply()}else{const amount=view[2]*.08;if(e.key==='ArrowLeft')view[0]-=amount;if(e.key==='ArrowRight')view[0]+=amount;if(e.key==='ArrowUp')view[1]-=amount;if(e.key==='ArrowDown')view[1]+=amount;apply()}}});
      const toPoint=(x,y)=>{const p=svg.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(svg.getScreenCTM().inverse())};
      svg.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const p=toPoint(e.clientX,e.clientY);zoom(e.deltaY>0?1.12:.89,p.x,p.y)},{passive:false});
      svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);moved=false;if(pointers.size===1)drag={x:e.clientX,y:e.clientY,v:view.slice()};else if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1])};drag=null}});
      svg.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2&&pinch){const [a,b]=[...pointers.values()],distance=Math.hypot(a[0]-b[0],a[1]-b[1]);if(distance>0){const p=toPoint((a[0]+b[0])/2,(a[1]+b[1])/2);zoom(pinch.distance/distance,p.x,p.y);pinch.distance=distance;moved=true}return}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5){moved=true;if(!svg.hasPointerCapture(e.pointerId))svg.setPointerCapture(e.pointerId);}const rect=svg.getBoundingClientRect(),ratio=Math.max(drag.v[2]/rect.width,drag.v[3]/rect.height);view=[drag.v[0]-dx*ratio,drag.v[1]-dy*ratio,drag.v[2],drag.v[3]];apply()});
      const stop=e=>{pointers.delete(e.pointerId);drag=null;pinch=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId)};
      svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
      return {reset(){view=[0,0,1100,610];apply()},select:choose};
    } catch(error) {
      if(container.isConnected)container.innerHTML='<p class="map-instructions">Карта не загрузилась. Проверьте соединение и обновите страницу.</p>';
      console.error('Atlas load failed',error);
    }
  };
})();

/* Discovery map and route details. */
const DISCOVERY_LOCATIONS = [
  ['bashkortostan', 'Башкортостан'], ['tatarstan', 'Татарстан'], ['karelia', 'Карелия'],
  ['dagestan', 'Дагестан'], ['altai', 'Алтай'], ['yakutia', 'Якутия'],
  ['kamchatka', 'Камчатка'], ['crimea', 'Крым'],
];

function discoveryAtlasPage(u) {
  const progress = kidProgress(u);
  const badges = u?.rewards?.includes('kurai') ? 1 : 0;
  return `<div class="discovery-atlas" id="discoveryAtlas">
    <header class="discovery-heading">
      <h1>Куда отправимся <em>сегодня?</em></h1>
      <p>Выбирай место. Знакомься с людьми. Собирай свою историю.</p>
    </header>
    <div class="discovery-stage">
      <nav class="discovery-index" aria-label="Регионы на карте">
        <h2>Регионы</h2>
        ${DISCOVERY_LOCATIONS.map(([id, name]) => {
          const open = id === 'bashkortostan';
          return `<button type="button" class="discovery-region" data-atlas-region="${id}" aria-pressed="${open}">
            <span>${name}</span>
            <span class="discovery-region-state">${open ? 'Открыт' : kidIcon('lock') + '<span class="visually-hidden">Маршрут готовится</span>'}</span>
          </button>`;
        }).join('')}
      </nav>
      <section class="discovery-map-column" aria-label="Карта открытий">
        <div class="discovery-map-card">
          <div class="atlas-map" id="atlasMap"><p class="map-instructions" role="status">Разворачиваем карту…</p></div>
        </div>
        <div class="discovery-map-note">
          <span>${kidIcon('compass')} Золотой компас отмечает открытый маршрут</span>
          <button type="button" data-discovery-help>${kidIcon('help')} Как двигать карту?</button>
        </div>
      </section>
      <aside class="discovery-panel" aria-label="Выбранный маршрут">
        <a class="discovery-player" href="#profile">
          ${u?.character ? gameCharacter(u, {gear:false}) : kidIcon('compass')}
          <span><strong>${esc(u?.nick || 'Путешественник')}</strong><small>${progress.xp} опыта · ${badges} значков</small></span>
        </a>
        <section class="discovery-location" id="locationPanel" aria-live="polite">
          ${discoveryLocationDetails('Башкортостан', true, u)}
        </section>
      </aside>
    </div>
    <div class="discovery-links">
      <a href="#book/bashkortostan">${kidIcon('book')} Книга открытий</a>
      <a href="#wardrobe">${kidIcon('bag')} Мой рюкзак</a>
    </div>
    <dialog class="discovery-dialog" id="discoveryHelp" aria-labelledby="discoveryHelpTitle">
      <button type="button" class="discovery-close" aria-label="Закрыть подсказку">×</button>
      <h2 id="discoveryHelpTitle">Карта в твоих руках</h2>
      <p>Выбери регион на карте или в списке. Золотой компас отмечает открытый маршрут, замок — главу, которую мы готовим.</p>
      <p>Приближай карту кнопкой + и двигай её мышью или пальцем. На телефоне масштаб можно менять двумя пальцами.</p>
      <p>С клавиатуры: стрелки перемещают карту, + и − меняют масштаб, 0 возвращает общий вид. Выбрать отметку — Enter.</p>
      <button class="discovery-action" type="button" data-discovery-close>Понятно!</button>
    </dialog>
  </div>`;
}

function discoveryLocationDetails(name, available, u) {
  const story = u?.story || {};
  const done = !!story.completed;
  const total = STORY_ORDER.length;
  const step = storyStepIndex(story);
  const current = done ? total : step + 1;
  const route = done || !step ? 'book/bashkortostan' : 'story';
  const action = done ? 'Открыть книгу' : step ? 'Продолжить историю' : 'Отправиться в гости';

  return `<div class="discovery-location-status ${available ? 'is-open' : ''}">
    ${kidIcon(available ? 'compass' : 'lock')} ${available ? 'Маршрут открыт' : 'Маршрут готовится'}
  </div>
  <h2>${esc(name)}</h2>
  <p>${available
    ? 'Данияр приглашает помочь семье подготовиться к Сабантую. Готовим чак-чак, собираем наряды и узнаём первые башкирские слова.'
    : 'Этот маршрут ещё готовится. Первое путешествие уже ждёт тебя в Башкортостане.'}</p>
  ${available ? `<div class="discovery-facts">
      <span>${kidIcon('book')} ${total} сцен</span>
      <span>${kidIcon('compass')} Около 20 минут</span>
    </div>
    <div class="discovery-progress-label">
      <span>${done ? 'История пройдена' : 'Текущая остановка'}</span><strong>${current} / ${total}</strong>
    </div>
    <progress class="discovery-progress" max="${total}" value="${current}" aria-label="Прогресс маршрута"></progress>
    <a class="discovery-action" href="#${route}">${action}</a>`
    : '<button class="discovery-action" type="button" data-atlas-region="bashkortostan">Показать открытый маршрут</button>'}`;
}

function wireDiscoveryAtlas(u) {
  const root = document.getElementById('discoveryAtlas');
  if (!root) return;
  const panel = root.querySelector('#locationPanel');
  const dialog = root.querySelector('#discoveryHelp');
  const regionButtons = [...root.querySelectorAll('.discovery-region')];
  let controller;
  let pendingSelection = 'bashkortostan';

  renderRussiaMap(root.querySelector('#atlasMap'), (id, name, available) => {
    if (!root.isConnected) return;
    panel.innerHTML = discoveryLocationDetails(name, available, u);
    for (const button of regionButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.atlasRegion === id || button.firstElementChild.textContent === name));
    }
    if (controller && matchMedia('(max-width: 680px)').matches) {
      panel.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }).then(map => {
    if (!root.isConnected) return;
    map?.select(pendingSelection, true);
    controller = map;
  });

  root.addEventListener('click', event => {
    const region = event.target.closest('[data-atlas-region]');
    if (region) {
      pendingSelection = region.dataset.atlasRegion;
      controller?.select(pendingSelection, true);
    }
    if (event.target.closest('[data-discovery-help]')) dialog.showModal();
    if (event.target.closest('[data-discovery-close], .discovery-close')) dialog.close();
  });
}
