/* First screen adapted from the user-supplied HTML reference. */
let firstScreenCleanup=null;
function firstScreenHome(u){const ready=!!u?.character,progress=typeof kidProgress==='function'?kidProgress(u):{xp:0},route=ready?(u.tutorialDone?'map':'tutorial'):u?'character':'login',action=ready?'Продолжить путешествие':'Создать персонажа',completed=!!u?.story?.completed,badges=u?.rewards?.includes('kurai')?1:0;let time='day';try{time=localStorage.getItem('ethnohod-first-light')||time}catch{}if(!['dawn','day','dusk'].includes(time))time='day';return `<section class="first-screen" id="firstScreen" data-time="${time}"><div class="fs-landscape" aria-hidden="true">
<svg viewBox="0 0 1280 714" preserveAspectRatio="xMidYMid slice" focusable="false">
  <defs>
    <image id="fs-valley-image" href="assets/first-valley.webp" width="1280" height="714"/>
    <filter id="fs-ridge-edge"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="fs-grass-edge"><feGaussianBlur stdDeviation="12"/></filter>
    <mask id="fs-peaks" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="714">
      <path filter="url(#fs-ridge-edge)" fill="white" d="M-80 182L26 120 52 138 74 147 114 131 132 139 168 161 203 131 232 125 253 133 274 132 315 166 341 158 374 145 394 133 420 132 451 111 470 117 499 136 513 154 539 148 548 152 569 149 594 161 615 161 643 143 665 133 688 127 718 147 747 146 773 156 800 172 832 119 855 102 871 114 889 112 912 130 941 144 958 148 987 130 1006 130 1024 139 1064 121 1103 113 1146 92 1176 76 1218 45 1251 31 1360 8V800H-80Z"/>
    </mask>
    <mask id="fs-slopes" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="714">
      <path filter="url(#fs-grass-edge)" fill="white" d="M-80 108L26 120 58 140 90 139 116 132 150 149 188 168 236 189 285 200 352 215 405 234 473 260 533 286 590 328 639 315 716 287 783 254 841 225 913 203 978 166 1039 142 1104 112 1183 72 1251 32 1360 0V800H-80Z"/>
    </mask>
    <mask id="fs-meadow" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="714">
      <path filter="url(#fs-grass-edge)" fill="white" d="M-80 419Q115 420 218 413T401 404Q500 401 584 394T754 394Q884 367 984 390T1360 335V800H-80Z"/>
    </mask>
  </defs>
  <use href="#fs-valley-image"/>
  <g data-d="6"><use href="#fs-valley-image" mask="url(#fs-peaks)"/></g>
  <g data-d="14"><use href="#fs-valley-image" mask="url(#fs-slopes)"/></g>
  <g data-d="29"><use href="#fs-valley-image" mask="url(#fs-meadow)"/></g>
</svg>
</div>
<div class="fs-lens" aria-hidden="true"></div>
<div class="fs-title-wrap"><h1 class="fs-title" aria-label="Этноход">${'ЭТНОХОД'.split('').map((c,i)=>`<span aria-hidden="true" style="--letter:${i}">${c}</span>`).join('')}</h1></div>
<div class="fs-ui"><div class="fs-top"><a class="fs-logo" href="#home" aria-label="Этноход — главная"><svg width="34" height="34" viewBox="0 0 40 40" fill="none" stroke="#ffc94a" stroke-width="1.8" aria-hidden="true"><circle cx="20" cy="20" r="4" fill="#ffc94a"/><ellipse cx="20" cy="9" rx="3.5" ry="7"/><ellipse cx="20" cy="31" rx="3.5" ry="7"/><ellipse cx="9" cy="20" rx="7" ry="3.5"/><ellipse cx="31" cy="20" rx="7" ry="3.5"/></svg>этноход</a><nav class="fs-nav" aria-label="Навигация первого экрана"><a href="#${u?'map':'login'}">Карта</a><a href="#${u?'book':'login'}">Книга открытий</a><a href="#teacher">Учителю</a></nav><div class="fs-hud">${u?`<a href="#profile" aria-label="Открыть профиль ${esc(u.nick)}">${esc(u.nick)}</a><span>${progress.xp} опыта</span>`:'<a href="#login/return">Уже играю →</a>'}</div></div>
<div class="fs-times" role="group" aria-label="Время суток">${[['dawn','Рассвет','🌅'],['day','День','☀️'],['dusk','Закат','🌇']].map(([id,name,icon])=>`<button type="button" data-fs-time="${id}" class="${time===id?'on':''}" aria-pressed="${time===id}" aria-label="${name}" title="${name}">${icon}</button>`).join('')}</div>
<div class="fs-copy"><h2>${ready?'Новые открытия уже ждут тебя!':'Большое путешествие начинается с тебя!'}</h2><p>${ready?'Выбирай, к кому отправиться в гости. Готовь угощения, узнавай новые слова и собирай подарки для своего героя.':'Создай путешественника и отправляйся в гости к народам России. Данияр уже ждёт в Башкортостане — поможем его семье подготовиться к празднику!'}</p><div class="fs-copy-actions"><a class="fs-primary-link" href="#${route}">${action} <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 19 5M9 5h10v10"/></svg></a>${!u?'<a class="fs-return-link" href="#login/return">У меня есть персонаж →</a>':'<a class="fs-return-link" href="#wardrobe">Мой рюкзак →</a>'}</div><div class="fs-chips"><span>${kidIcon('compass')} ${completed?'Первая глава пройдена':'Башкортостан открыт'}</span><span>${kidIcon('star')} ${u?badges+' значков':'Подарки за приключение'}</span><a href="#${u?'book':'login'}">${kidIcon('book')} Моя книга</a></div></div>
<a class="fs-cta" href="#${ready?'map':'about'}" aria-label="${ready?'Карта открытий':'Об игре'}"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="fs-cta-circle" d="M100 100m-82 0a82 82 0 1 1 164 0a82 82 0 1 1-164 0"/></defs><text><textPath href="#fs-cta-circle">${ready?'КАРТА ОТКРЫТИЙ · КАРТА ОТКРЫТИЙ':'ОБ ИГРЕ · ОТКРОЙ ЭТНОХОД · ОБ ИГРЕ'} · </textPath></text></svg><i><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></i></a></div></section>`}
function wireFirstScreen() {
  const root = document.querySelector('#firstScreen');
  if (!root) return;

  const lighting = root.querySelectorAll('[data-fs-time]');
  lighting.forEach(button => {
    button.onclick = () => {
      root.dataset.time = button.dataset.fsTime;
      lighting.forEach(option => {
        option.classList.toggle('on', option === button);
        option.setAttribute('aria-pressed', String(option === button));
      });
      try {
        localStorage.setItem('ethnohod-first-light', root.dataset.time);
      } catch {}
    };
  });

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const layers = root.querySelectorAll('[data-d]');
  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;

  function paint() {
    frame = 0;
    x += (targetX - x) * .12;
    y += (targetY - y) * .12;
    layers.forEach(layer => {
      const depth = Number(layer.dataset.d);
      layer.setAttribute('transform', `translate(${x * depth} ${y * depth * .6})`);
    });
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .002) schedule();
  }

  function schedule() {
    if (!frame && motion.matches) frame = requestAnimationFrame(paint);
  }

  function move(event) {
    if (!motion.matches || event.pointerType === 'touch') return;
    const bounds = root.getBoundingClientRect();
    targetX = .5 - (event.clientX - bounds.left) / bounds.width;
    targetY = .5 - (event.clientY - bounds.top) / bounds.height;
    schedule();
  }

  function leave() {
    targetX = 0;
    targetY = 0;
    schedule();
  }

  function resetMotion() {
    cancelAnimationFrame(frame);
    frame = targetX = targetY = x = y = 0;
    layers.forEach(layer => layer.removeAttribute('transform'));
  }

  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', leave);
  motion.addEventListener('change', resetMotion);
  firstScreenCleanup = () => {
    resetMotion();
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerleave', leave);
    motion.removeEventListener('change', resetMotion);
    firstScreenCleanup = null;
  };
}
