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
    kitchenHeat('pan', 'Обжарь кусочки до золотистого цвета', 'fried'),
    kitchenAdd('pot', 'Смешай мёд с сахаром для сиропа', 'honey', 'sugar'),
    kitchenHeat('pot', 'Прогрей сироп, чтобы сахар растворился', 'syrup'),
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

  const { station, title, items, action, art, heat, moves } = step;
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
    : heat ? 'Включи плиту и дождись готовности.'
    : 'Проведи несколько раз по рабочей поверхности или нажми кнопку.';
  return `<section class="vk-kitchen" aria-label="Игровая кухня">
    <div class="vk-heading"><div><h2>${dish.title}</h2><p>${dish.summary}</p></div>
    <span>Шаг ${progress.step + 1} из ${dish.steps.length}</span></div>
    ${table}
    <div class="vk-stage">
      <div class="vk-instruction">
        <progress aria-label="Прогресс рецепта" max="${dish.steps.length}" value="${progress.step}"></progress>
        <h3 id="vk-step" tabindex="-1">${title}</h3><p>${hint}</p>
      </div>
      <div class="vk-tray ${items ? '' : 'vk-tray-tools'}">${items ? items.map(id => {
        const label = kitchenProducts[id];
        const added = progress.added.includes(id);
        return `<button type="button" data-vk-add="${id}" ${added ? 'disabled' : ''}><span class="vk-ingredient" aria-hidden="true">${added ? '✓' : kitchenImage(id, 'vk-ingredient-art')}</span>${label}</button>`;
      }).join('') : ''}</div>
      <div class="vk-counter">
        <div class="vk-station vk-${station}" data-vk-station aria-hidden="true">
          <div class="vk-vessel">${contents.slice(-3).map(id => kitchenImage(id, 'vk-picture')).join('')}</div>
          ${action ? kitchenImage(kitchenTools[action] || 'spoon', 'vk-tool') : ''}
        </div>
        <span class="vk-station-label">${kitchenStations[station]}</span>
      </div>
      <div class="vk-controls">${action || heat ?
        `<button type="button" data-vk-work>${heat ? 'Включить плиту' : action}</button>` : ''}
        ${moves ? `<progress aria-label="${action}" value="${progress.moves}" max="${moves}"></progress>` : ''}
        <p role="status" data-vk-status>${items ? `Добавлено ${progress.added.length} из ${items.length}` : ''}</p>
      </div>
    </div>
    <p class="vk-note">Семейный вариант рецепта. Время в игре сокращено. На настоящей кухне с ножом и плитой помогают взрослые.</p>
  </section>`;
}

function wireVisitCooking(u, s, redraw) {
  const root = document.querySelector('.vk-kitchen');
  if (!root) return;
  const { dish, progress, step } = visitKitchenState(s);
  if (!dish) return;
  const station = root.querySelector('[data-vk-station]');
  const status = root.querySelector('[data-vk-status]');
  const work = root.querySelector('[data-vk-work]');
  let gesture;
  let ignoreClick = false;
  let heating = false;

  function advance() {
    progress.step++;
    progress.added = [];
    progress.moves = 0;
    if (progress.step === dish.steps.length) s.cooking[dish.id] = [0, 1, 2];
    redraw('#vk-step');
  }

  function add(id) {
    if (!step.items?.includes(id) || progress.added.includes(id)) return;
    progress.added.push(id);
    if (progress.added.length === step.items.length) advance();
    else redraw('[data-vk-add]:not(:disabled)');
  }

  function perform() {
    if (step.heat) {
      if (heating) return;
      heating = true;
      work.disabled = true;
      station.classList.add('vk-heating');
      status.textContent = 'На плите…';
      window.setTimeout(() => {
        if (root.isConnected) advance();
      }, 2300);
    } else if (step.moves) {
      progress.moves++;
      if (progress.moves >= step.moves) advance();
      else redraw('[data-vk-work]');
    }
  }

  root.querySelectorAll('[data-vk-add]:not(:disabled)').forEach(button => {
    button.onclick = () => { if (!ignoreClick) add(button.dataset.vkAdd); };
    button.onpointerdown = event => {
      if (!event.isPrimary || event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      gesture = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
    };
    button.onpointermove = event => {
      if (gesture?.pointer !== event.pointerId) return;
      const x = event.clientX - gesture.x;
      const y = event.clientY - gesture.y;
      if (Math.hypot(x, y) < 8 && !gesture.dragging) return;
      gesture.dragging = true;
      button.classList.add('vk-dragging');
      button.style.transform = `translate(${x}px, ${y}px)`;
      station.classList.toggle('vk-drop', overStation(event));
    };
    function overStation(event) {
      const rect = station.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
    }
    function finish(event) {
      if (gesture?.pointer !== event.pointerId) return;
      const dragged = gesture.dragging;
      gesture = null;
      button.classList.remove('vk-dragging');
      button.style.transform = '';
      station.classList.remove('vk-drop');
      if (event.type !== 'pointerup' || !dragged) return;
      ignoreClick = true;
      window.setTimeout(() => { ignoreClick = false; }, 0);
      if (overStation(event)) add(button.dataset.vkAdd);
      else status.textContent = 'Отпусти продукт над рабочей поверхностью.';
    }
    button.onpointerup = finish;
    button.onpointercancel = finish;
    button.onlostpointercapture = finish;
  });

  if (work) work.onclick = perform;
  if (step.moves) {
    const tool = station.querySelector('.vk-tool');
    station.classList.add('vk-swipe');
    station.onpointerdown = event => {
      if (!event.isPrimary || event.button !== 0) return;
      station.setPointerCapture(event.pointerId);
      gesture = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
    };
    station.onpointermove = event => {
      if (gesture?.pointer !== event.pointerId) return;
      const rect = station.getBoundingClientRect();
      const x = Math.max(15, Math.min(rect.width - 15, event.clientX - rect.left));
      const y = Math.max(15, Math.min(rect.height - 15, event.clientY - rect.top));
      tool.style.left = x + 'px';
      tool.style.top = y + 'px';
      tool.classList.add('vk-tool-in-use');
    };
    function resetGesture() {
      gesture = null;
      tool.classList.remove('vk-tool-in-use');
      tool.style.left = tool.style.top = '';
    }
    station.onpointerup = event => {
      if (gesture?.pointer !== event.pointerId) return;
      const distance = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y);
      resetGesture();
      if (distance >= 22) perform();
    };
    station.onpointercancel = station.onlostpointercapture = resetGesture;
  }
}
