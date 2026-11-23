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
      container.innerHTML = `<div class="map-hover" aria-live="polite"></div><svg class="russia-svg" viewBox="0 0 1100 610" preserveAspectRatio="xMidYMid meet" tabindex="0" role="group" aria-label="Интерактивный атлас: выберите регион или отметку маршрута. Масштаб — кнопками плюс и минус, перемещение — стрелками или перетаскиванием."><defs><pattern id="atlas-land-dots" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#dce6cf"/><circle cx="4" cy="4" r="1.75" fill="#42664e"/></pattern><pattern id="map-grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#999471" stroke-width=".4" opacity=".12"/></pattern></defs><rect x="-3000" y="-2000" width="7000" height="5000" fill="url(#map-grid)"/><g class="map-regions">${data.regions.map(r=>`<path class="map-path ${r.id==='bashkortostan'?'is-available':''}" style="--region-fill:${palette[data.regions.indexOf(r)%palette.length]}" d="${r.d}" data-region="${safe(r.id)}"><title>${safe(r.name)}</title></path>`).join('')}</g>${terrain}<g class="map-pins">${pins}</g><g transform="translate(1010 95)" fill="none" stroke="#9a8c61" stroke-width="1"><circle r="27"/><path d="M0-36V36M-36 0H36M0-28L-5 0 0-5 5 0Z"/><text x="0" y="-45" fill="#81764f" stroke="none" text-anchor="middle" font-family="Georgia" font-size="12">С</text></g></svg>`;
      const svg = container.querySelector('svg');
      const status = container.querySelector('.map-hover');
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const bounds = { width: 1100, height: 610 };
      const names = {altai:'Республика Алтай',kamchatka:'Камчатский край'};
      const controls = container.closest('.discovery-atlas');
      const select = controls.querySelector('[data-atlas-select]');
      select.insertAdjacentHTML('beforeend', data.regions.slice().sort((a,b) => a.name.localeCompare(b.name,'ru'))
        .map(region => `<option value="${safe(region.id)}">${safe(region.name)}</option>`).join(''));

      const pointers = new Map();
      const viewport = { width: svg.clientWidth || 1, height: svg.clientHeight || 1 };
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      const fit = () => Math.min((viewport.width - 24) / bounds.width, (viewport.height - 100) / bounds.height);
      const mobile = () => viewport.width <= 760;
      const overview = () => ({ x: 550, y: 280, scale: Math.max(.1, fit()) });
      let camera = mobile() ? {x:300,y:295,scale:Math.max(fit(),viewport.width / 610)} : overview();
      let target = {...camera};
      let frame = 0;
      let animation;
      let moved = false;
      let start = null;
      let selected = null;
      let touched = false;

      function paint() {
        const width = viewport.width / camera.scale;
        const height = viewport.height / camera.scale;
        svg.setAttribute('viewBox', `${camera.x - width / 2} ${camera.y - height / 2} ${width} ${height}`);
      }

      function animate(now) {
        frame = 0;
        if (!svg.isConnected || !animation) return;
        const {from, time, duration} = animation;
        const t = clamp((now - time) / duration, 0, 1);
        const phase = 1 - (1 - t) ** 4;
        camera = {
          x: from.x + (target.x - from.x) * phase,
          y: from.y + (target.y - from.y) * phase,
          scale: from.scale * (target.scale / from.scale) ** phase,
        };
        paint();
        if (t < 1) frame = requestAnimationFrame(animate);
        else animation = null;
      }

      function move(next, duration = 0) {
        target = {
          x: clamp(next.x, 24, bounds.width - 24),
          y: clamp(next.y, 20, bounds.height - 20),
          scale: clamp(next.scale, Math.max(.08, fit() * .78), Math.max(2.2, fit() * 5.4)),
        };
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        if (!duration || motion.matches) {
          animation = null;
          camera = {...target};
          paint();
          return;
        }
        animation = {from:{...camera}, time:performance.now(), duration};
        frame = requestAnimationFrame(animate);
      }

      function zoom(factor, point = {x:viewport.width / 2,y:viewport.height / 2}, duration = 320) {
        touched = true;
        const previous = duration ? target : camera;
        const scale = clamp(previous.scale * factor, Math.max(.08, fit() * .78), Math.max(2.2, fit() * 5.4));
        const dx = point.x - viewport.width / 2;
        const dy = point.y - viewport.height / 2;
        move({x:previous.x + dx / previous.scale - dx / scale, y:previous.y + dy / previous.scale - dy / scale, scale}, duration);
      }

      function mark(id, isPin) {
        container.querySelectorAll('.is-selected').forEach(element => {
          element.classList.remove('is-selected');
          if (element.hasAttribute('aria-pressed')) element.setAttribute('aria-pressed', 'false');
        });
        if (!id) return;
        const element = container.querySelector(`[${isPin ? 'data-location' : 'data-region'}="${id}"]`);
        element?.classList.add('is-selected');
        if (isPin) element?.setAttribute('aria-pressed', 'true');
      }

      function focusRegion(point) {
        const scale = Math.max(fit() * 2.05, mobile() ? 1.12 : .25);
        const x = point.x + viewport.width * (mobile() ? 0 : .12) / scale;
        const y = point.y + viewport.height * (mobile() ? .16 : .025) / scale;
        move({x,y,scale}, 760);
      }

      function choose(id, isPin = false) {
        const item = (isPin ? data.locations : data.regions).find(region => region.id === id);
        if (!item) return;
        const route = isPin ? item : data.locations.find(location =>
          location.id === id || location.name === item.name || names[location.id] === item.name
        );
        const region = isPin ? data.regions.find(candidate =>
          candidate.id === id || candidate.name === item.name || candidate.name === names[id]
        ) : item;
        const path = svg.querySelector(`[data-region="${region?.id}"]`);
        const box = path?.getBBox();
        selected = route || (box ? {x:box.x + box.width / 2,y:box.y + box.height / 2} : null);
        mark(route?.id || item.id, !!route);
        select.value = region?.id || '';
        const available = !!route?.available || id === 'bashkortostan';
        status.textContent = `${route?.name || item.name} · ${available ? 'маршрут открыт' : 'маршрут готовится'}`;
        touched = true;
        onSelect(route?.id || item.id, route?.name || item.name, available);
        if (selected) focusRegion(selected);
      }

      const clear = () => {
        mark();
        selected = null;
        select.value = '';
        status.textContent = '';
      };
      const reset = () => {
        clear();
        touched = true;
        move(overview(), 620);
      };

      controls.querySelectorAll('[data-zoom]').forEach(button => {
        button.addEventListener('click', () => {
          if (button.dataset.zoom === 'reset') {
            reset();
            controls.dispatchEvent(new Event('atlasreset'));
          } else zoom(button.dataset.zoom === 'in' ? 1.3 : 1 / 1.3);
        });
      });
      select.addEventListener('change', event => { if (event.target.value) choose(event.target.value); });
      svg.addEventListener('click', event => {
        if (moved) { moved = false; return; }
        const pin = event.target.closest('[data-location]');
        const region = event.target.closest('[data-region]');
        if (pin) choose(pin.dataset.location, true);
        else if (region) choose(region.dataset.region);
      });
      svg.addEventListener('keydown', event => {
        const pin = event.target.closest('[data-location]');
        if (pin && ['Enter',' '].includes(event.key)) {
          event.preventDefault();
          choose(pin.dataset.location, true);
          return;
        }
        const direction = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
        if (!direction && !['+','=','-','0'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === '0') {
          reset();
          controls.dispatchEvent(new Event('atlasreset'));
        } else if (direction) {
          touched = true;
          move({x:target.x + direction[0] * 85 / target.scale,y:target.y + direction[1] * 85 / target.scale,scale:target.scale}, 260);
        } else zoom(event.key === '-' ? 1 / 1.3 : 1.3);
      });
      svg.addEventListener('wheel', event => {
        event.preventDefault();
        touched = true;
        const rect = svg.getBoundingClientRect();
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.height : 1);
        zoom(Math.exp(-clamp(delta,-120,120) * .0025), {x:event.clientX - rect.left,y:event.clientY - rect.top}, 235);
      }, {passive:false});
      svg.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        if (!pointers.size) {
          moved = false;
          start = {x:event.clientX,y:event.clientY};
        }
        if (pointers.size >= 2) return;
        pointers.set(event.pointerId, {x:event.clientX,y:event.clientY});
      });
      svg.addEventListener('pointermove', event => {
        const previous = pointers.get(event.pointerId);
        if (!previous) return;
        const next = {x:event.clientX,y:event.clientY};
        if (pointers.size === 2) {
          const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1];
          const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
          const newDistance = Math.hypot(next.x - other.x, next.y - other.y);
          if (oldDistance > 0 && newDistance > 0) {
            const rect = svg.getBoundingClientRect();
            const mid = {x:(previous.x + other.x) / 2 - rect.left,y:(previous.y + other.y) / 2 - rect.top};
            zoom(newDistance / oldDistance, mid, 0);
            move({x:camera.x - (next.x - previous.x) / (2 * camera.scale),y:camera.y - (next.y - previous.y) / (2 * camera.scale),scale:camera.scale});
          }
          moved = true;
        } else if (moved || Math.hypot(next.x - start.x, next.y - start.y) > 5) {
          move({x:camera.x - (next.x - previous.x) / camera.scale,y:camera.y - (next.y - previous.y) / camera.scale,scale:camera.scale});
          touched = true;
          moved = true;
        }
        pointers.set(event.pointerId, next);
        if (moved && !svg.hasPointerCapture(event.pointerId)) svg.setPointerCapture(event.pointerId);
      });
      function stop(event) {
        pointers.delete(event.pointerId);
        if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
      }
      svg.addEventListener('pointerup', stop);
      svg.addEventListener('pointercancel', stop);
      svg.addEventListener('pointerleave', event => {
        if (!svg.hasPointerCapture(event.pointerId)) stop(event);
      });

      const observer = new ResizeObserver(() => {
        viewport.width = svg.clientWidth || 1;
        viewport.height = svg.clientHeight || 1;
        if (selected) focusRegion(selected);
        else if (!touched) move(mobile() ? {x:300,y:295,scale:Math.max(fit(),viewport.width / 610)} : overview());
        else move(camera);
      });
      observer.observe(svg);
      paint();
      return {
        select: choose,
        clear,
        destroy() {
          observer.disconnect();
          if (frame) cancelAnimationFrame(frame);
        },
      };
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
    <section class="atlas-map" id="atlasMap" aria-label="Карта открытий">
      <p class="map-instructions" role="status">Разворачиваем карту…</p>
    </section>
    <header class="discovery-heading">
      <h1>Куда отправимся<br><em>сегодня?</em></h1>
      <p>Выбери место. Знакомься с людьми. Собирай свою историю.</p>
    </header>
    <a class="discovery-player" href="#profile" aria-label="Мой герой">
      ${u?.character ? gameCharacter(u, {gear:false}) : kidIcon('compass')}
      <span><strong>${esc(u?.nick || 'Путешественник')}</strong><small>${progress.xp} опыта · ${badges} значков</small></span>
    </a>
    <aside class="discovery-panel" id="atlasPanel" aria-label="Выбранный маршрут" inert>
      <button type="button" class="discovery-close" data-atlas-dismiss aria-label="Закрыть карточку">×</button>
      <section class="discovery-location" id="locationPanel" aria-live="polite"></section>
    </aside>
    <div class="discovery-dock">
      <nav class="discovery-index" aria-label="Регионы на карте">
        ${DISCOVERY_LOCATIONS.map(([id, name]) => {
          const available = id === 'bashkortostan';
          return `<button type="button" class="discovery-region ${available ? 'is-open' : ''}" data-atlas-region="${id}" aria-pressed="false" aria-controls="atlasPanel">
            ${kidIcon(available ? 'compass' : 'lock')} <span>${name}</span>
          </button>`;
        }).join('')}
      </nav>
      <div class="discovery-controls" aria-label="Управление картой">
        <button type="button" data-zoom="in" aria-label="Приблизить карту" title="Приблизить">+</button>
        <button type="button" data-zoom="out" aria-label="Отдалить карту" title="Отдалить">−</button>
        <button type="button" data-zoom="reset" aria-label="Показать всю карту" title="Показать всю карту">↺</button>
        <select data-atlas-select aria-label="Выбрать регион на карте"><option value="">Найти регион</option></select>
        <button type="button" data-discovery-help aria-label="Как двигать карту?" title="Как двигать карту?">${kidIcon('help')}</button>
      </div>
    </div>
    <dialog class="discovery-dialog" id="discoveryHelp" aria-labelledby="discoveryHelpTitle">
      <button type="button" class="discovery-close" data-discovery-close aria-label="Закрыть подсказку">×</button>
      <h2 id="discoveryHelpTitle">Карта в твоих руках</h2>
      <p>Выбери отметку или регион внизу. Золотой компас отмечает открытый маршрут.</p>
      <p>Перетаскивай карту мышью или пальцем. Для масштаба используй колесо, кнопки + и − или жест двумя пальцами.</p>
      <p>С клавиатуры: стрелки двигают карту, + и − меняют масштаб, 0 показывает всю карту. Enter открывает выбранную отметку.</p>
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
  const route = done ? 'book/bashkortostan' : step ? 'story' : 'region';
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
  const panel = root.querySelector('#atlasPanel');
  const details = root.querySelector('#locationPanel');
  const dialog = root.querySelector('#discoveryHelp');
  const regionButtons = [...root.querySelectorAll('.discovery-region')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let controller;
  let pendingSelection;
  let previousFocus;

  function dismiss() {
    if (panel.inert) return;
    if (panel.contains(document.activeElement)) {
      (previousFocus?.isConnected ? previousFocus : root.querySelector('.russia-svg'))?.focus({preventScroll:true});
    }
    panel.inert = true;
    root.classList.remove('has-selection');
    controller?.clear();
    for (const button of regionButtons) button.setAttribute('aria-pressed', 'false');
  }

  renderRussiaMap(root.querySelector('#atlasMap'), (id, name, available) => {
    if (!root.isConnected) return;
    if (!panel.contains(document.activeElement) && document.activeElement !== document.body) previousFocus = document.activeElement;
    const focusFallback = details.contains(document.activeElement);
    details.innerHTML = discoveryLocationDetails(name, available, u);
    panel.inert = false;
    root.classList.add('has-selection');
    if (focusFallback) panel.querySelector('[data-atlas-dismiss]').focus({preventScroll:true});
    if (!motion.matches) details.animate([{opacity:.45, transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:380,easing:'cubic-bezier(.2,.75,.25,1)'});
    for (const button of regionButtons) {
      button.setAttribute('aria-pressed',String(button.dataset.atlasRegion === id));
    }
  }).then(map => {
    if (!root.isConnected) { map?.destroy(); return; }
    controller = map;
    if (pendingSelection) controller?.select(pendingSelection,true);
  });

  root.addEventListener('atlasreset', dismiss);
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !dialog.open) dismiss();
  });
  root.addEventListener('click', event => {
    const region = event.target.closest('[data-atlas-region]');
    if (region) {
      pendingSelection = region.dataset.atlasRegion;
      controller?.select(pendingSelection,true);
    }
    if (event.target.closest('[data-atlas-dismiss]')) dismiss();
    if (event.target.closest('[data-discovery-help]')) dialog.showModal();
    if (event.target.closest('[data-discovery-close]')) dialog.close();
  });
  return () => controller?.destroy();
}
