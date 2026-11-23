function regionPage(user) {
  return `<div class="region-screen" id="regionScreen">
    <header class="region-hero">
      <div class="region-hero-media" aria-hidden="true">
        <video id="regionVideo" muted loop playsinline preload="none" poster="assets/bashkortostan-region.webp" data-src="assets/bashkortostan-region.mp4"></video>
      </div>
      <div class="region-hero-shade" aria-hidden="true"></div>
      <div class="region-hero-content">
        ${visitBookToolbar()}
        <div class="region-title">
          <p>Южный Урал · Предуралье</p>
          <h1>Башкортостан</h1>
        </div>
        <section class="region-intro" id="regionIntro" aria-label="Вступление к маршруту" hidden></section>
        <button class="region-video-toggle fs-video-toggle" type="button" aria-label="Приостановить фоновое видео" hidden><span aria-hidden="true"></span></button>
      </div>
    </header>
    ${visitBookPage(user, 'bashkortostan', undefined, true)}
  </div>`;
}

function isRegionIntro(user) {
  return storyStepIndex(user.story) < storyStepIndex({step:2});
}

function regionIntroCard(user, step) {
  const first = step === 0;
  const title = first ? 'Данияр ждёт тебя в гости' : 'Подготовимся к Сабантую';
  const text = first
    ? `«Һаумыһығыҙ, ${esc(user.nick)}! Меня зовут Данияр. Приезжай к нам в Башкортостан, помоги моей семье подготовиться к Сабантую!»`
    : 'Башкортостан находится на Южном Урале и в Предуралье, его столица — Уфа. Семья Данияра уже готовится к празднику. Начнём на кухне: вместе соберём ингредиенты и приготовим угощение.';
  return `<article class="region-intro-card" data-marten-stage="${step}">
    <div class="region-intro-meta">
      <p class="region-intro-kicker">${first ? 'Приглашение' : 'Первая остановка'}</p>
      <p class="region-intro-count" aria-label="Шаг ${first ? '1 из 2' : '2 из 2'}">${first ? '1' : '2'} / 2</p>
    </div>
    <h1 id="regionIntroTitle" tabindex="-1">${title}</h1>
    <p class="region-intro-text">${text}</p>
    <div class="region-intro-actions">
      <button type="button" class="region-intro-next" data-region-next>
        ${first ? 'Продолжить' : 'На кухню'} ${kidIcon('arrow')}
      </button>
      ${first
        ? '<a class="region-intro-back" href="#region">К региону</a>'
        : '<button type="button" class="region-intro-back" data-region-back>Назад</button>'}
      <div class="region-intro-guide">${martenButton()}</div>
    </div>
  </article>`;
}

function showRegionIntro(user, show, direction = 'next') {
  const screen = document.getElementById('regionScreen');
  if (!screen) return;
  const intro = screen.querySelector('#regionIntro');
  const wasOpen = !intro.hidden;
  if (!show && !wasOpen) return;

  screen.classList.toggle('is-intro', show);
  screen.querySelector('.region-title').hidden = show;
  screen.querySelector('.visit-book').hidden = show;
  intro.hidden = !show;
  document.title = show ? 'В гостях у Данияра · Этноход' : 'Башкортостан · Этноход';
  if (show) {
    const state = storyState(user);
    visitTrackScene(user, state.step);
    intro.dataset.direction = direction;
    intro.innerHTML = regionIntroCard(user, state.step);
    intro.querySelector('h1').focus({preventScroll:true});
  } else {
    visitFlushTime(user);
    intro.replaceChildren();
  }
  if (show !== wasOpen) window.scrollTo({top:0,behavior:'instant'});
}

function wireRegionPage(user) {
  const intro = document.getElementById('regionIntro');
  intro.addEventListener('click', event => {
    const next = event.target.closest('[data-region-next]');
    const back = event.target.closest('[data-region-back]');
    if (!next && !back) return;
    const state = storyState(user);
    if (!isRegionIntro(user)) return;
    if (back) {
      state.step = STORY_ORDER[0];
      state.feedback = '';
      showRegionIntro(user, true, 'back');
      return;
    }

    if (!advanceStoryScene(user, state)) return;
    if (isRegionIntro(user)) showRegionIntro(user, true);
    else {
      save();
      history.replaceState(null, '', '#story');
      render();
    }
  });
}
