/* Home screen with the supplied valley video. */
let backgroundVideoCleanup=null;
function firstScreenHome(u){const ready=!!u?.character,progress=typeof kidProgress==='function'?kidProgress(u):{xp:0},route=ready?'map':u?'character':'login',action=ready?'Продолжить путешествие':'Создать персонажа';return `<section class="first-screen" id="firstScreen"><div class="fs-landscape" aria-hidden="true">
<video muted loop playsinline preload="none" poster="assets/first-screen-valley.webp" data-src="assets/first-screen-valley.mp4"></video>
</div>
<div class="fs-lens" aria-hidden="true"></div>

<div class="fs-ui"><div class="fs-top"><a class="fs-logo" href="#home" aria-label="Этноход — главная"><svg width="34" height="34" viewBox="0 0 40 40" fill="none" stroke="#ffc94a" stroke-width="1.8" aria-hidden="true"><circle cx="20" cy="20" r="4" fill="#ffc94a"/><ellipse cx="20" cy="9" rx="3.5" ry="7"/><ellipse cx="20" cy="31" rx="3.5" ry="7"/><ellipse cx="9" cy="20" rx="7" ry="3.5"/><ellipse cx="31" cy="20" rx="7" ry="3.5"/></svg>этноход</a><nav class="fs-nav" aria-label="Навигация первого экрана"><a href="#${u?'map':'login'}">Карта</a><a href="#${u?'book':'login'}">Книга открытий</a><a href="#teacher">Учителю</a></nav><div class="fs-hud">${u?`<a href="#profile" aria-label="Открыть профиль ${esc(u.nick)}"><b class="fs-nickname">${esc(u.nick)}</b></a><span>${progress.xp} опыта</span>`:'<a href="#login/return">Уже играю →</a>'}</div></div>
<div class="fs-title-wrap"><h1 class="fs-title" aria-label="Этноход">${'ЭТНОХОД'.split('').map((c,i)=>`<span aria-hidden="true" style="--letter:${i}">${c}</span>`).join('')}</h1></div>
<div class="fs-copy"><h2>${ready?'Новые открытия уже ждут тебя!':'Большое путешествие начинается с тебя!'}</h2><p>${ready?'Выбирай, к кому отправиться в гости. Готовь угощения, узнавай новые слова и собирай подарки для своего героя.':'Создай путешественника и отправляйся в гости к народам России. Данияр уже ждёт в Башкортостане — поможем его семье подготовиться к празднику!'}</p><div class="fs-copy-actions"><a class="fs-primary-link" href="#${route}">${action} <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 19 5M9 5h10v10"/></svg></a><div class="fs-secondary-actions">${!u?'<a class="fs-return-link" href="#login/return">У меня есть персонаж →</a>':'<a class="fs-return-link" href="#wardrobe">Мой рюкзак →</a>'}<button type="button" class="fs-video-toggle" aria-label="Запустить фоновое видео" title="Запустить фоновое видео" hidden><span aria-hidden="true"></span></button></div></div></div></div></section>`}
function wireFirstScreen() {
  backgroundVideoCleanup = wireLoopingBackground(
    document.querySelector('#firstScreen video'),
    document.querySelector('#firstScreen .fs-video-toggle')
  );
}

function wireLoopingBackground(video, toggle) {
  if (!video || !toggle) return null;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;

  function updateButton() {
    const label = video.paused ? 'Запустить фоновое видео' : 'Приостановить фоновое видео';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.classList.toggle('is-playing', !video.paused);
  }

  function play() {
    video.play().catch(updateButton);
  }

  function applyMotionPreference() {
    if (motion.matches) {
      toggle.hidden = true;
      video.autoplay = false;
      video.pause();
      if (video.hasAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
      return;
    }
    toggle.hidden = false;
    video.autoplay = !userPaused;
    if (!video.hasAttribute('src')) {
      video.muted = true;
      video.src = video.dataset.src;
    }
    if (!userPaused) play();
    updateButton();
  }

  toggle.onclick = () => {
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else play();
  };
  video.addEventListener('play', updateButton);
  video.addEventListener('pause', updateButton);
  motion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();

  return () => {
    motion.removeEventListener('change', applyMotionPreference);
    video.removeEventListener('play', updateButton);
    video.removeEventListener('pause', updateButton);
    video.pause();
  };
}
