const visitWaterSource = 'https://kitaptar.bashkort.org/book/1516';
const visitWaterFrames = [
  { title: 'Герой у источника', text: 'Урал-батыр добрался до Живого родника.', atlas: [100, 50] },
  { title: 'Разговор со стариком', text: 'Старик рассказал Уралу, как тяжело жить вечно.', image: 'assets/campfire-elder.webp' },
  { title: 'Вода падает на землю', text: 'Урал набрал живой воды и окропил ею землю.', atlas: [0, 100] },
  { title: 'Земля оживает', text: 'Земля зазеленела. Урал отдал живую воду всему живому.', atlas: [100, 100] }
];

function visitWaterArt(frame) {
  if (frame.image) return `<img class="water-art" src="${frame.image}" alt="" width="720" height="480">`;
  return `<span class="water-art water-atlas" aria-hidden="true" style="--frame-x:${frame.atlas[0]}%;--frame-y:${frame.atlas[1]}%"></span>`;
}

function visitWaterSequence() {
  return `<ol class="water-sequence">${visitWaterFrames.map(frame =>
    `<li>${visitWaterArt(frame)}<strong>${frame.title}</strong><p>${frame.text}</p></li>`).join('')}</ol>`;
}

function visitWaterBook() {
  return `<article class="visit-collected-legend water-book"><h2>Живая вода</h2>
    <p>Пересказ эпизода башкирского эпоса «Урал-батыр», который Данияр рассказал у костра.</p>
    ${visitWaterSequence()}
    <p><a href="${visitWaterSource}" target="_blank" rel="noopener">«Башкирское народное творчество». Том 1 «Эпос»</a></p></article>`;
}

function visitCampfirePage(u, s) {
  const camp = s.campfire;
  const slots = camp?.slots ?? [null, null, null, null];
  const locked = camp?.locked ?? [];
  return `<section class="water-panel" aria-labelledby="water-title">
    <div class="water-campsite" aria-hidden="true">${storyHuman()}<span class="water-fire"></span></div>
    <header class="water-header"><h2 id="water-title" tabindex="-1">История у костра</h2>
      <p>Подготовка к Сабантую закончилась. Вечером Данияр садится рядом: «Хочешь, расскажу, что Урал-батыр сделал с живой водой?»</p></header>
    ${camp?.done ? `<h3>Живая вода</h3>${visitWaterSequence()}
      <p>История сохранена в Книге открытий. Данияр спрашивает: «Почему, по-твоему, Урал отдал воду земле?»</p>
      <a class="game-text-link" href="#book/bashkortostan/legend">Открыть легенду в книге →</a>` :
      `<details class="water-telling" ${camp?.reading ? 'open' : ''}><summary>Прочитать пересказ</summary>
        <p>${visitWaterFrames.map(frame => frame.text).join(' ')}</p></details>
      <p>Выбери четыре кадра по порядку. Нажми на кадр в ленте, чтобы вернуть его в набор.</p>
      <ol class="water-slots" aria-label="Лента истории">${slots.map((id, index) => `<li>
        ${id === null ? `<span aria-label="Пустое место ${index + 1}">${index + 1}</span>` :
        `<button type="button" data-water-remove="${index}" ${locked.includes(index) ? 'disabled' : ''}
          aria-label="${locked.includes(index) ? 'Верно' : 'Убрать'}, кадр ${index + 1} — ${visitWaterFrames[id].title}">
          ${visitWaterArt(visitWaterFrames[id])}<strong>${index + 1}. ${visitWaterFrames[id].title}</strong></button>`}</li>`).join('')}</ol>
      <div class="water-tray" role="group" aria-label="Кадры эпоса">${[2, 0, 3, 1].map(id => `<button type="button" data-water-add="${id}" ${slots.includes(id) ? 'disabled' : ''}>
        ${visitWaterArt(visitWaterFrames[id])}<strong>${visitWaterFrames[id].title}</strong></button>`).join('')}</div>
      <button class="kid-primary" type="button" data-water-check ${slots.includes(null) ? 'disabled' : ''}>Проверить</button>
      <p class="water-feedback" id="water-feedback" role="status" tabindex="-1">${camp?.retry ? 'Верные кадры остались на местах. Вспомни, что произошло после разговора со стариком.' : ''}</p>`}
    <details class="water-old-epic" ${s.fullEpicOpen ? 'open' : ''}><summary>Открыть пересказ эпоса в шести страницах</summary>
      ${visitLegendPage(u, s)}</details>
  </section>`;
}

function wireVisitCampfire(u, s, redraw) {
  const root = document.querySelector('.water-panel');
  if (!root) return;
  const camp = s.campfire;
  const rememberDetails = (selector, update) => {
    const details = root.querySelector(selector);
    details?.querySelector('summary').addEventListener('click', () => {
      update(!details.open);
      save();
    });
  };
  rememberDetails('.water-telling', open => { camp.reading = open; });
  rememberDetails('.water-old-epic', open => { s.fullEpicOpen = open; });

  root.querySelectorAll('[data-water-add]:enabled').forEach(button => {
    button.onclick = () => {
      camp.slots[camp.slots.indexOf(null)] = Number(button.dataset.waterAdd);
      const next = [2, 0, 3, 1].find(id => !camp.slots.includes(id));
      redraw(next === undefined ? '[data-water-check]' : `[data-water-add="${next}"]`);
    };
  });
  root.querySelectorAll('[data-water-remove]:enabled').forEach(button => {
    button.onclick = () => {
      const index = Number(button.dataset.waterRemove);
      const id = camp.slots[index];
      camp.slots[index] = null;
      redraw(`[data-water-add="${id}"]`);
    };
  });
  const check = root.querySelector('[data-water-check]');
  if (check) check.onclick = () => {
    if (camp.slots.includes(null)) return;
    camp.locked = camp.slots.flatMap((id, index) => id === index ? [index] : []);
    if (camp.locked.length === visitWaterFrames.length) {
      camp.done = true;
      visitRecord(u, 'legendRead');
      redraw('#water-title');
    } else {
      camp.slots = camp.slots.map((id, index) => id === index ? id : null);
      camp.retry = true;
      visitRecord(u, 'error', {topic: 'legend'});
      redraw('#water-feedback');
    }
  };
}

function visitFestivalChoices(s) {
  const choices = [];
  if (s.cooking.chakchak?.length === 3) choices.push(['food', 'Чак-чак']);
  if ([0, 1].every(i => s.outfits[i]?.length === 3)) {
    const motif = visitCollectedMotifs(s).at(-1);
    choices.push(['motif', motif?.name ?? 'Праздничный наряд']);
  }
  if (s.campfire?.done) choices.push(['water', 'Живая вода']);
  return choices;
}

function visitFestivalScene(s) {
  const choices = visitFestivalChoices(s);
  if (!choices.length) return '';
  const selected = choices.find(([id]) => id === s.sharedDiscovery);
  const motif = visitCollectedMotifs(s).at(-1);
  const scenes = {
    food: `<img class="festival-dish" src="assets/kitchen/chak.png" alt="Тарелка чак-чака" width="192" height="160">
      <p>Ты угощаешь гостя чак-чаком: «Мы нарезали тесто, обжарили кусочки и перемешали их с медовым сиропом. Так готовят в семье Данияра».</p>`,
    motif: `<div class="festival-outfit">${visitPatternCostume(0, 6, motif)}</div>
      <p>Ты показываешь гостю праздничный наряд. «${motif ? `Это ${motif.name.toLowerCase()}. Я собрал этот узор из деталей по образцу` : 'Я помог украсить наряд узорными полосами'}».</p>`,
    water: `<p>Ты открываешь четыре кадра и рассказываешь гостю, почему Урал отдал живую воду земле.</p>${visitWaterSequence()}`
  };
  return `<section class="water-panel festival-discovery" aria-labelledby="festival-discovery-title">
    <h2 id="festival-discovery-title">Что покажешь гостю?</h2>
    <p>«Я пропустил ваше путешествие. Что мне стоит увидеть первым?»</p>
    <div class="festival-choices" role="group" aria-label="Карточки из Книги открытий">${choices.map(([id, title]) =>
      `<button type="button" data-share-discovery="${id}" aria-pressed="${selected?.[0] === id}">${title}</button>`).join('')}</div>
    ${selected ? `<article class="festival-response" tabindex="-1" id="festival-response"><h3>${selected[1]}</h3>${scenes[selected[0]]}
      <p>«Рәхмәт! Теперь и мне хочется узнать больше», — говорит гость.</p></article>` : ''}
  </section>`;
}
