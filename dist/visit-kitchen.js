/* Cooking chapter. Completed dishes retain the story's existing save format. */
const kitchenProducts = {
  egg: 'Яйцо', flour: 'Мука', salt: 'Соль',
  oil: 'Масло', honey: 'Мёд', sugar: 'Сахар',
  dough: 'Тесто', strips: 'Кусочки теста',
  fried: 'Обжаренные кусочки', syrup: 'Медовый сироп',
  water: 'Вода', meat: 'Мясо', plates: 'Пласты теста',
  broth: 'Горячий бульон', onion: 'Лук',
  boiled: 'Варёные пласты', cookedMeat: 'Отварное мясо',
  onions: 'Мягкий лук', noodles: 'Сырая лапша',
  soup: 'Суп с лапшой', chak: 'Чак-чак'
};
const kitchenAdd = (station, title, ...items) => ({ station, title, items });
const kitchenWork = (station, title, action, art, moves = 3) => ({ station, title, action, art, moves });
const kitchenHeat = (station, title, art) => ({ station, title, art, heat: true });
const kitchenDough = [
  kitchenAdd('bowl', 'Собери тесто', 'egg', 'flour', 'salt'),
  kitchenWork('bowl', 'Замеси тесто', 'Замесить', 'dough'),
  kitchenAdd('board', 'Переложи отдохнувшее тесто на доску', 'dough'),
  kitchenWork('board', 'Тонко раскатай тесто', 'Раскатать', 'sheet')
];
const kitchenDishes = [
  { id: 'chakchak', title: 'Чак-чак', summary: 'Золотистые кусочки теста в медовом сиропе', steps: [
    ...kitchenDough,
    kitchenWork('board', 'Нарежь тесто короткими полосками', 'Нарезать', 'strips'),
    kitchenAdd('pan', 'Налей масло в сковороду', 'oil'),
    kitchenHeat('pan', 'Разогрей масло', 'oil'),
    kitchenAdd('pan', 'Добавь кусочки теста в горячее масло', 'strips'),
    { station: 'pan', title: 'Обжарь кусочки до золотистого цвета', art: 'fried', fry: true },
    kitchenAdd('pot', 'Смешай мёд с сахаром для сиропа', 'honey', 'sugar'),
    { station: 'pot', title: 'Приготовь медовый сироп', art: 'syrup', pour: true },
    kitchenAdd('bowl', 'Соедини кусочки без лишнего масла с сиропом', 'fried', 'syrup'),
    kitchenWork('bowl', 'Перемешай, чтобы сироп покрыл кусочки', 'Перемешать', 'fried', 2),
    kitchenAdd('plate', 'Выложи чак-чак горкой на блюдо', 'chak')
  ] },
  { id: 'beshbarmak', title: 'Бешбармак', summary: 'Отварное мясо, пласты теста и лук', steps: [
    kitchenAdd('pot', 'Положи мясо в кастрюлю с холодной водой', 'meat', 'water'),
    kitchenHeat('pot', 'Отвари мясо до мягкости и сохрани бульон', 'broth'),
    ...kitchenDough,
    kitchenWork('board', 'Разрежь пласт теста на ромбы', 'Нарезать', 'plates'),
    { ...kitchenAdd('pot', 'Опусти ромбы в кипящий мясной бульон', 'plates'), base: 'broth' },
    kitchenHeat('pot', 'Отвари пласты теста до готовности', 'boiled'),
    kitchenAdd('pan', 'Добавь нарезанный лук и немного бульона', 'onion', 'broth'),
    kitchenHeat('pan', 'Припусти лук в бульоне до мягкости', 'onions'),
    kitchenAdd('plate', 'Выложи на блюдо варёные пласты', 'boiled'),
    kitchenAdd('plate', 'Добавь нарезанное отварное мясо', 'cookedMeat'),
    kitchenAdd('plate', 'Выложи сверху лук, а бульон подай отдельно', 'onions', 'broth')
  ] },
  { id: 'tukmach', title: 'Тукмас (тукмач)', summary: 'Домашняя лапша в мясном бульоне', steps: [
    ...kitchenDough,
    kitchenWork('board', 'Нарежь тесто тонкой лапшой', 'Нарезать', 'noodles'),
    kitchenAdd('pot', 'Налей готовый мясной бульон', 'broth'),
    kitchenHeat('pot', 'Доведи бульон до кипения', 'broth'),
    kitchenAdd('pot', 'Опусти лапшу в кипящий бульон', 'noodles'),
    kitchenHeat('pot', 'Вари лапшу до мягкости', 'soup'),
    kitchenAdd('bowl', 'Разлей суп с лапшой по пиалам', 'soup')
  ] }
];
const kitchenStations = {
  bowl: 'Миска', board: 'Доска', pan: 'Сковорода', pot: 'Кастрюля', plate: 'Блюдо'
};

function visitKitchenState(s) {
  const index = kitchenDishes.findIndex(dish => s.cooking[dish.id]?.length !== 3);
  if (index < 0) return { index };
  const dish = kitchenDishes[index];
  // Earlier unfinished recipes did not store any equivalent cooking steps.
  if (s.kitchen?.version !== 2 || s.kitchen.dish !== dish.id) {
    s.kitchen = { version: 2, dish: dish.id, step: 0, moves: 0, added: [] };
  }
  const progress = s.kitchen;
  const step = dish.steps[progress.step];
  return { index, dish, progress, step };
}

const kitchenTools = { 'Раскатать': 'rolling-pin', 'Нарезать': 'knife' };
const kitchenFeastArt = { chakchak: 'chak', beshbarmak: 'beshbarmak', tukmach: 'soup' };

function kitchenImage(id, className) {
  return `<img class="${className}" src="assets/kitchen/${id}.png" alt="" width="192" height="160" draggable="false">`;
}

const kitchenFryCount = 6;
let kitchenSound = false;
let kitchenAudio;

function playKitchenSound(pitch) {
  if (!kitchenSound || !window.AudioContext) return;
  try {
    kitchenAudio ||= new AudioContext();
    kitchenAudio.resume().catch(() => {});
    const tone = kitchenAudio.createOscillator();
    const gain = kitchenAudio.createGain();
    const time = kitchenAudio.currentTime;
    tone.type = 'triangle';
    tone.frequency.value = pitch;
    gain.gain.setValueAtTime(.045, time);
    gain.gain.exponentialRampToValueAtTime(.001, time + .19);
    tone.connect(gain);
    gain.connect(kitchenAudio.destination);
    tone.start();
    tone.stop(time + .2);
  } catch { /* Sound is optional. */ }
}

function renderVisitCooking(u, s) {
  const { index, dish, progress, step } = visitKitchenState(s);
  const table = `<ol class="vk-menu" aria-label="Праздничное меню">${kitchenDishes.map((item, i) => {
    const done = s.cooking[item.id]?.length === 3;
    return `<li ${i === index ? 'aria-current="step"' : ''}>
      <span aria-hidden="true">${done ? '✓' : i + 1}</span><div><strong>${item.title}</strong>
      <small>${done ? 'На столе' : i === index ? 'Готовим' : 'В меню'}</small></div></li>`;
  }).join('')}</ol>`;
  if (!dish) return `<section class="vk-kitchen"><h2 tabindex="-1" id="vk-step">Праздничный стол готов!</h2>${table}
    <div class="vk-feast">${kitchenDishes.map(item => `<figure>${kitchenImage(kitchenFeastArt[item.id], 'vk-served')}<figcaption>${item.title}</figcaption></figure>`).join('')}</div>
    <p>Все блюда на столе. Теперь можно готовить праздничные наряды.</p></section>`;

  const { station, title, items, action, heat, moves, fry, pour } = step;
  const knead = action === 'Замесить';
  const previous = dish.steps[progress.step - 1];
  const keepPrevious = previous?.station === station;
  const serving = station === 'plate'
    ? dish.steps.slice(0, progress.step).filter(part => part.station === 'plate').flatMap(part => part.items)
    : [];
  const contents = [...new Set([
    ...(keepPrevious ? previous.art ? [previous.art] : [...(previous.items || []), previous.base] : []),
    ...serving,
    step.base,
    ...progress.added
  ].filter(Boolean))];
  const hint = items ? 'Перетащи продукты на рабочую поверхность или нажми на них.'
    : fry ? 'Снимай кусочки со сковороды, когда они станут золотистыми.'
    : pour ? 'Удерживай кувшин и отпусти, когда уровень попадёт в зелёную зону.'
    : heat ? 'Включи плиту и дождись готовности.'
    : knead ? 'Веди ложкой по кругу. Три оборота — и тесто готово.'
    : 'Проведи инструментом по рабочей поверхности или нажми кнопку.';
  const collected = progress.fried ?? [];
  const fx = fry ? 'fry' : pour ? 'pour' : knead ? 'knead' : heat ? 'heat' : items ? 'add' : 'work';
  return `<section class="vk-kitchen" data-vk-mode="${fx}" aria-label="Игровая кухня">
    <div class="vk-heading"><div><h2>${dish.title}</h2><p>${dish.summary}</p></div>
    <div class="vk-heading-tools"><span>Шаг ${progress.step + 1} из ${dish.steps.length}</span>
    <button class="vk-sound" type="button" data-vk-sound aria-pressed="${kitchenSound}">${kitchenSound ? 'Звук вкл.' : 'Звук выкл.'}</button></div></div>
    ${table}
    <div class="vk-stage">
      <div class="vk-instruction">
        <h3 id="vk-step" tabindex="-1">${title}</h3><p>${hint}</p>
        <div class="vk-recipe-meter" role="progressbar" aria-label="Прогресс рецепта" aria-valuemin="0" aria-valuemax="${dish.steps.length}" aria-valuenow="${progress.step}">${dish.steps.map((_,i) => `<i class="${i < progress.step ? 'is-done' : i === progress.step ? 'is-current' : ''}"></i>`).join('')}</div>
      </div>
      <div class="vk-tray ${items ? '' : 'vk-tray-tools'}">${items ? items.map(id => {
        const label = kitchenProducts[id];
        const added = progress.added.includes(id);
        return `<button type="button" data-vk-add="${id}" ${added ? 'disabled' : ''}><span class="vk-ingredient" aria-hidden="true">${added ? '✓' : kitchenImage(id, 'vk-ingredient-art')}</span>${label}</button>`;
      }).join('') : ''}</div>
      <div class="vk-counter">
        ${pour ? `<button type="button" class="vk-jar" data-vk-hold aria-label="Удерживать кувшин с сиропом">${kitchenImage('honey','vk-jar-art')}<span>Кувшин</span></button>
          <div class="vk-pour-meter" aria-hidden="true"><i></i><span></span></div>` : ''}
        <div class="vk-station vk-${station}" data-vk-station ${fry ? 'role="group" aria-label="Кусочки на сковороде"' : 'aria-hidden="true"'}>
          ${knead ? '<div class="vk-knead-ring"></div>' : ''}
          <div class="vk-vessel">${fry ? `<div class="vk-fry-tray">${Array.from({length:kitchenFryCount},(_,i) =>
            `<button type="button" class="vk-fry-piece" data-vk-fry="${i}" data-state="${collected.includes(i) ? 'done' : 'pale'}" ${collected.includes(i) ? 'disabled' : ''} aria-label="Кусочек ${i+1}"></button>`).join('')}</div>`
            : contents.slice(-3).map(id => kitchenImage(id, 'vk-picture')).join('')}
          ${knead ? kitchenImage('dough','vk-dough-art') : ''}</div>
          ${action ? kitchenImage(kitchenTools[action] || 'spoon', 'vk-tool') : ''}
          ${heat ? '<div class="vk-steam"><i></i><i></i><i></i></div>' : ''}
        </div>
        ${pour ? '<i class="vk-stream" aria-hidden="true"></i>' : ''}
        <span class="vk-station-label">${kitchenStations[station]}</span>
      </div>
      <div class="vk-controls">${action || heat || fry || pour
        ? `<button type="button" data-vk-work>${heat ? 'Включить плиту' : fry ? 'Снять золотистый кусочек' : pour ? 'Добавить порцию' : action}</button>` : ''}
        ${moves ? `<progress aria-label="${action}" value="${progress.moves}" max="${moves}"></progress>` : ''}
        <p role="status" data-vk-status>${items ? `Добавлено ${progress.added.length} из ${items.length}` : fry ? `Готово ${collected.length} из ${kitchenFryCount}` : ''}</p>
      </div>
    </div>
  </section>`;
}

function wireVisitCooking(u, s, redraw) {
  const root = document.querySelector('.vk-kitchen');
  if (!root) return;
  const { dish, index, progress, step } = visitKitchenState(s);
  if (!dish) return;

  const station = root.querySelector('[data-vk-station]');
  const status = root.querySelector('[data-vk-status]');
  const work = root.querySelector('[data-vk-work]');
  const sound = root.querySelector('[data-vk-sound]');
  const vessel = station.querySelector('.vk-vessel');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const message = text => { status.textContent = text; };
  let busy = false;

  sound.onclick = () => {
    kitchenSound = !kitchenSound;
    sound.setAttribute('aria-pressed', String(kitchenSound));
    sound.textContent = kitchenSound ? 'Звук вкл.' : 'Звук выкл.';
    playKitchenSound(440);
  };

  function celebrate() {
    if (reducedMotion.matches) return;
    vessel.animate([{transform:'scale(1)'},{transform:'scale(1.08,.92)'},{transform:'scale(.98,1.04)'},{transform:'scale(1)'}],
      {duration:440,easing:'ease-out'});
    for (let i=0;i<12;i++) {
      const spark = document.createElement('i');
      spark.className = 'vk-spark';
      spark.setAttribute('aria-hidden','true');
      station.append(spark);
      const angle = i * Math.PI / 6;
      spark.animate([
        {transform:'translate(0,0) scale(.7)',opacity:1},
        {transform:`translate(${Math.cos(angle)*83}px,${Math.sin(angle)*55-16}px) scale(.24)`,opacity:0},
      ], {duration:370+i%4*55,easing:'cubic-bezier(.2,.7,.3,1)'}).finished.then(() => spark.remove(), () => spark.remove());
    }
  }

  function advance() {
    if (busy) return;
    busy = true;
    progress.step++;
    progress.added = [];
    progress.moves = 0;
    delete progress.fried;
    const finished = progress.step === dish.steps.length;
    if (finished) s.cooking[dish.id] = [0, 1, 2];
    save();
    root.querySelectorAll('.vk-stage button').forEach(button => { button.disabled = true; });
    celebrate();
    playKitchenSound(720);

    if (finished) {
      const result = document.createElement('section');
      result.className = 'vk-result';
      result.innerHTML = `<div class="vk-result-card">${kitchenImage(kitchenFeastArt[dish.id], 'vk-served')}
        <h3 tabindex="-1">${dish.title} — готово!</h3><p>Рецепт добавлен в Книгу открытий.</p>
        <button type="button">${index + 1 === kitchenDishes.length ? 'Накрыть стол' : 'Готовить следующее блюдо'}</button></div>`;
      root.querySelector('.vk-stage').inert = true;
      root.append(result);
      result.querySelector('h3').focus();
      result.querySelector('button').onclick = () => redraw('#vk-step');
    } else {
      window.setTimeout(() => { if (root.isConnected) redraw('#vk-step'); }, reducedMotion.matches ? 0 : 360);
    }
  }

  function flyIngredient(button) {
    if (reducedMotion.matches) return;
    const art = button.querySelector('img')?.cloneNode();
    if (!art) return;
    const from = button.getBoundingClientRect();
    const to = vessel.getBoundingClientRect();
    art.className = 'vk-flying-product';
    Object.assign(art.style,{left:from.x+from.width/2+'px',top:from.y+from.height/2+'px'});
    document.body.append(art);
    const dx = to.x+to.width/2-from.x-from.width/2;
    const dy = to.y+to.height/2-from.y-from.height/2;
    art.animate([
      {transform:'translate(-50%,-50%) scale(1)',opacity:1},
      {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(25deg) scale(.35)`,opacity:0},
    ],{duration:355,easing:'cubic-bezier(.35,.03,.63,.94)'}).finished.then(() => art.remove(), () => art.remove());
  }

  function add(button) {
    const id = button.dataset.vkAdd;
    if (busy || !step.items?.includes(id) || progress.added.includes(id)) return;
    flyIngredient(button);
    progress.added.push(id);
    button.disabled = true;
    button.querySelector('.vk-ingredient').textContent = '✓';
    vessel.insertAdjacentHTML('beforeend', kitchenImage(id, 'vk-picture vk-picture-arrival'));
    message(`Добавлено ${progress.added.length} из ${step.items.length}`);
    if (progress.added.length === step.items.length) advance();
    else {
      save();
      celebrate();
      playKitchenSound(320 + progress.added.length * 70);
      if (button === document.activeElement) root.querySelector('[data-vk-add]:not(:disabled)')?.focus({preventScroll:true});
    }
  }

  let drag;
  let ignoreClick = false;
  root.querySelectorAll('[data-vk-add]:not(:disabled)').forEach(button => {
    button.onclick = () => { if (!ignoreClick) add(button); };
    button.onpointerdown = event => {
      if (!event.isPrimary || event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      drag = { x:event.clientX, y:event.clientY, pointer:event.pointerId, active:false };
    };
    const overStation = event => {
      const rect = station.getBoundingClientRect();
      return event.clientX >= rect.left - 12 && event.clientX <= rect.right + 12 &&
        event.clientY >= rect.top - 12 && event.clientY <= rect.bottom + 12;
    };
    button.onpointermove = event => {
      if (drag?.pointer !== event.pointerId) return;
      const x = event.clientX - drag.x;
      const y = event.clientY - drag.y;
      if (!drag.active && Math.hypot(x,y) < 8) return;
      drag.active = true;
      button.classList.add('vk-dragging');
      button.style.transform = `translate(${x}px, ${y}px) rotate(${Math.max(-14,Math.min(14,x/7))}deg)`;
      station.classList.toggle('vk-drop', overStation(event));
    };
    function endDrag(event) {
      if (drag?.pointer !== event.pointerId) return;
      const active = drag.active;
      drag = null;
      if (event.type === 'pointerup' && active) {
        ignoreClick = true;
        window.setTimeout(() => { ignoreClick = false; },0);
        if (overStation(event)) add(button);
        else message('Отпусти продукт над рабочей поверхностью.');
      }
      button.style.transform = '';
      button.classList.remove('vk-dragging');
      station.classList.remove('vk-drop');
    }
    button.onpointerup = endDrag;
    button.onpointercancel = endDrag;
    button.onlostpointercapture = endDrag;
  });

  if (step.heat) work.onclick = () => {
    if (busy || work.disabled) return;
    work.disabled = true;
    station.classList.add('vk-heating');
    message('На плите…');
    window.setTimeout(() => { if (root.isConnected) advance(); }, 2300);
  };
  if (step.fry) wireKitchenFry(root, station, progress, {message, advance, celebrate});
  if (step.pour) wireKitchenPour(root, {message, advance});
  if (step.moves) {
    const tool = station.querySelector('.vk-tool');
    const meter = root.querySelector('.vk-controls progress');
    const knead = step.action === 'Замесить';
    let gesture;
    station.classList.add('vk-swipe');
    function paintWork() {
      const ratio = progress.moves / step.moves;
      station.style.setProperty('--vk-work-progress', ratio * 100 + '%');
      if (knead) station.style.setProperty('--vk-dough', ratio);
      meter.value = progress.moves;
      return ratio;
    }
    function update(amount) {
      if (busy) return;
      progress.moves = Math.min(step.moves, progress.moves + amount);
      const ratio = paintWork();
      message(`${Math.round(ratio*100)}% готово`);
      if (ratio >= 1) advance();
    }
    paintWork();
    work.onclick = () => {
      update(1);
      if (!busy) { save(); celebrate(); playKitchenSound(290); }
    };
    station.onpointerdown = event => {
      if (busy || !event.isPrimary || event.button !== 0) return;
      station.setPointerCapture(event.pointerId);
      gesture = { x:event.clientX, y:event.clientY, pointer:event.pointerId, angle:null };
    };
    station.onpointermove = event => {
      if (busy || gesture?.pointer !== event.pointerId) return;
      const rect = station.getBoundingClientRect();
      const x = Math.max(15, Math.min(rect.width-15, event.clientX-rect.left));
      const y = Math.max(15, Math.min(rect.height-15, event.clientY-rect.top));
      tool.style.left = x + 'px';
      tool.style.top = y + 'px';
      tool.classList.add('vk-tool-in-use');
      if (!knead) return;
      const dx = x-rect.width/2;
      const dy = y-rect.height/2;
      if (Math.hypot(dx,dy) < 18) { gesture.angle = null; return; }
      const angle = Math.atan2(dy,dx);
      if (gesture.angle !== null) {
        const delta = angle - gesture.angle;
        const arc = Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)));
        if (arc < Math.PI/2) update(arc / (2*Math.PI));
      }
      gesture.angle = angle;
    };
    function endWork(event) {
      if (gesture?.pointer !== event.pointerId) return;
      const distance = Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y);
      gesture = null;
      tool.classList.remove('vk-tool-in-use');
      tool.style.left = tool.style.top = '';
      if (!knead && event.type === 'pointerup' && distance >= 22) update(1);
      if (!busy) save();
    }
    station.onpointerup = endWork;
    station.onpointercancel = endWork;
    station.onlostpointercapture = endWork;
  }
}

function wireKitchenFry(root, station, progress, {message, advance, celebrate}) {
  const pieces = [...station.querySelectorAll('[data-vk-fry]')];
  const collected = progress.fried ??= [];
  const started = performance.now();
  const heatPhase = piece => (performance.now()-started+Number(piece.dataset.vkFry)*470) % 5600;
  const state = piece => {
    const time = heatPhase(piece);
    return time < 900 ? 'pale' : time < 3850 ? 'gold' : 'dark';
  };
  function paint() {
    for (const piece of pieces) {
      if (piece.disabled) continue;
      const now = state(piece);
      if (piece.dataset.state === now) continue;
      piece.dataset.state = now;
      piece.setAttribute('aria-label', `Кусочек ${Number(piece.dataset.vkFry)+1}, ${{pale:'бледный',gold:'золотистый, готов',dark:'пора попробовать снова'}[now]}`);
    }
  }
  paint();
  const timer = window.setInterval(() => {
    if (!root.isConnected || collected.length === kitchenFryCount) window.clearInterval(timer);
    else paint();
  },100);
  function collect(piece) {
    if (!piece || piece.disabled || state(piece) !== 'gold') {
      message(piece && state(piece) === 'dark' ? 'Этот кусочек подрумянился слишком сильно. Подожди следующую попытку.' : 'Дождись золотистого цвета.');
      playKitchenSound(175);
      if (piece && !matchMedia('(prefers-reduced-motion: reduce)').matches) piece.animate([{translate:'0'},{translate:'-4px'},{translate:'4px'},{translate:'0'}],{duration:235});
      return;
    }
    collected.push(Number(piece.dataset.vkFry));
    piece.dataset.state = 'done';
    piece.disabled = true;
    message(`Готово ${collected.length} из ${kitchenFryCount}`);
    if (collected.length === kitchenFryCount) { window.clearInterval(timer); advance(); }
    else { save(); celebrate(); playKitchenSound(540); }
  }
  pieces.forEach(piece => { piece.onclick = () => collect(piece); });
  root.querySelector('[data-vk-work]').onclick = () => collect(pieces.find(piece => !piece.disabled && state(piece) === 'gold'));
}

function wireKitchenPour(root, {message, advance}) {
  const counter = root.querySelector('.vk-counter');
  const jar = root.querySelector('[data-vk-hold]');
  const fallback = root.querySelector('[data-vk-work]');
  let level = 0;
  let holding;
  let frame;
  let usedPointer = false;

  function update(next) {
    level = Math.min(100,next);
    counter.style.setProperty('--vk-fill',level + '%');
  }
  function addPortion() {
    update(level + 25);
    if (level >= 62) finish();
    else message(`Добавлено ${level}%. Цель — от 62% до 86%.`);
  }
  function finish() {
    cancelAnimationFrame(frame);
    counter.classList.remove('vk-pouring');
    if (level >= 62 && level <= 86) {
      message('Ровно столько, сколько нужно!');
      advance();
    } else {
      message(level < 62 ? 'Маловато. Удерживай кувшин чуть дольше.' : 'Многовато. Отпусти кувшин немного раньше.');
      playKitchenSound(175);
      update(0);
    }
  }
  function tick(now) {
    if (!holding || !root.isConnected) return;
    update(holding.level + (now-holding.time) / 23);
    if (level < 100) frame = requestAnimationFrame(tick);
    else endHold(true);
  }
  function endHold(check) {
    if (!holding) return;
    holding = null;
    cancelAnimationFrame(frame);
    counter.classList.remove('vk-pouring');
    if (check) finish();
    else update(0);
  }
  jar.onpointerdown = event => {
    if (holding || event.button !== 0 || !event.isPrimary) return;
    usedPointer = true;
    jar.setPointerCapture(event.pointerId);
    holding = { time:performance.now(), level };
    counter.classList.add('vk-pouring');
    message('');
    frame = requestAnimationFrame(tick);
  };
  jar.onpointerup = () => endHold(true);
  jar.onpointercancel = jar.onlostpointercapture = () => endHold(false);
  jar.onclick = event => { if (!usedPointer || event.detail === 0) addPortion(); usedPointer = false; };
  fallback.onclick = () => { if (!holding) addPortion(); };
}
