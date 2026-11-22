export const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#163429">
<title>Этноход · Хакатон</title>
<link rel="stylesheet" href="/hackathon.css">
<script src="/hackathon.js" defer></script>
</head>
<body>
<header class="top"><a class="brand" href="/">Этноход</a><span>Хакатон</span></header>
<main id="app" aria-live="polite"><p class="loading">Загрузка…</p></main>
</body>
</html>`;

export const styles = `
:root {color-scheme:light;--forest:#163429;--deep:#0f2a20;--mint:#d9e5d8;--cream:#fbf7e8;--paper:#fffdf5;--gold:#f5c462;--text:#20362b;--muted:#4e6358;--line:#cbd8c8;--bad:#8e352c}
*{box-sizing:border-box}
body{margin:0;background:var(--cream);color:var(--text);font:1rem/1.5 system-ui,sans-serif}
button,input{font:inherit} button{cursor:pointer}
button:disabled{opacity:.56;cursor:wait} a{color:inherit}
:focus-visible{outline:3px solid #c07324;outline-offset:3px}
.top{height:66px;display:flex;align-items:center;justify-content:space-between;background:var(--forest);color:var(--cream);padding:0 max(20px,calc((100vw - 1120px)/2));gap:1rem}
.brand{font:700 1.8rem/1 Georgia,serif;text-decoration:none;letter-spacing:-.035em}
.top span{color:#efe0b8;font-size:.875rem}
main{width:min(1120px,calc(100% - 32px));margin:36px auto 64px}
h1,h2,p{margin:0} h1{font:700 clamp(2rem,5vw,3.5rem)/1.06 Georgia,serif;letter-spacing:-.04em}
h2{font-size:1.13rem;line-height:1.3}
.muted{color:var(--muted)}
.loading{padding:18px 0}
.card,.game{background:var(--paper);border:1px solid var(--line);border-radius:20px}
.card{padding:24px}.signin{max-width:540px;margin:auto}
.stack,.stats,.actions{display:grid;gap:14px}.stack{gap:18px}
.actions{display:flex;align-items:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.58rem 1rem;border:1px solid transparent;border-radius:9px;color:var(--cream);background:var(--forest);text-decoration:none;font-weight:700}
.btn:hover{background:#24513e}.btn.alt{color:var(--forest);background:transparent;border-color:#779487}
.btn.alt:hover{background:#e3eedd}.btn.gold{background:var(--gold);color:var(--deep)}.btn.gold:hover{background:#ffd484}
input{width:100%;min-height:44px;padding:.6rem .75rem;border:1px solid #83998d;border-radius:9px;background:#fffefa;color:var(--text)}
label{display:block;margin-bottom:5px;font-weight:650}
.error{min-height:1.5em;color:var(--bad);font-size:.94rem}.status{color:#285a37;min-height:1.5em}
.heading{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:16px}
.stats{grid-template-columns:repeat(3,minmax(0,1fr))}
.stat{padding:14px 18px;background:var(--mint);border-radius:12px}
.stat strong{display:block;font:700 1.95rem/1.1 Georgia,serif}.stat span{font-size:.9rem}
.create-fields{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:10px}
.invite{background:#e7efe2;border-radius:10px;padding:12px;margin-top:12px}
.invite input{margin-top:8px}
.table-wrap{overflow:auto;margin-top:14px}
table{width:100%;border-collapse:collapse;text-align:left;font-size:.94rem}
th,td{padding:.66rem .6rem;border-bottom:1px solid var(--line);vertical-align:middle}
th{white-space:nowrap;color:var(--muted);font-size:.875rem}td:nth-child(2){white-space:nowrap}td:last-child{white-space:nowrap}
progress{accent-color:#396e53;width:100%;height:12px;display:block}.row-progress{min-width:80px;width:96px}
.game{max-width:590px;margin:auto;overflow:hidden}
.art{background:linear-gradient(90deg,#142c25a8,#142c2530),url('/art.webp') center 44% / cover,var(--forest);padding:22px 24px;min-height:176px;display:flex;flex-direction:column;justify-content:flex-end;color:#fff8df;gap:8px}
.art p{font-weight:700;color:#fff0bd}.art h1{font-size:clamp(2.15rem,7vw,3.25rem);text-shadow:0 2px 6px #10271d}
.play{padding:20px 24px 23px}.play h2{font-size:clamp(1.22rem,4vw,1.46rem)}
.step{font-weight:750;color:#405d4f;font-size:.9rem;margin-bottom:4px}
.choices{display:grid;gap:8px;margin-top:14px}
.answer{text-align:left;border:1px solid #aabfb0;border-radius:10px;background:#f1f5e9;color:var(--text);min-height:44px;padding:.5rem .8rem;font-weight:700}
.answer:hover{border-color:var(--forest);background:#e3ecd9}
.feedback{padding:9px 12px;background:#e5eedc;color:#234c34;border-radius:9px;margin-top:10px;font-size:.94rem}
.score{font:700 2.6rem/1 Georgia,serif;color:var(--forest)}
@media(max-width:520px){main{margin-top:20px}.card{padding:16px}.heading{flex-wrap:wrap}.stat{padding:10px 8px}.stat span{font-size:.8rem}.create-fields{grid-template-columns:1fr}.play,.art{padding:16px}.art{min-height:124px}.btn{padding:.5rem .8rem}}
`;

export const client = String.raw`
'use strict';

const root = document.querySelector('#app');
const route = location.pathname;
const labels = { invited: 'Ссылка выдана', playing: 'В игре', finished: 'Завершено' };

const element = (tag, value, className) => {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (className) node.className = className;
  return node;
};

function section(html) {
  root.innerHTML = html;
  return root.firstElementChild;
}

async function api(path, data) {
  const response = await fetch(path, data === undefined ? {} : {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data),
  });
  const value = await response.json();
  if (!response.ok) throw Object.assign(new Error(value.error || 'Не удалось загрузить данные.'), { status: response.status });
  return value;
}

function replaceHash() {
  if (location.hash) history.replaceState(null, '', location.pathname);
}

function setMessage(node, error) {
  node.textContent = error?.message || '';
}

function renderSignIn(error) {
  section('<section class="card signin stack"><h1>Кабинет учителя</h1><p class="muted">Создавайте персональные ссылки и смотрите результаты мини-игры.</p><form id="login-form"><label for="key">Ключ учителя</label><input id="key" type="password" required autocomplete="off"><p class="error" id="login-error" role="status"></p><button class="btn">Войти</button></form></section>');
  const form = document.querySelector('#login-form');
  const button = form.querySelector('button');
  const status = document.querySelector('#login-error');
  setMessage(status, error);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    button.disabled = true;
    setMessage(status);
    try {
      await api('/api/teacher/login', {key:form.querySelector('input').value.trim()});
      await loadCabinet();
    } catch (failure) {
      setMessage(status, failure);
      button.disabled = false;
    }
  });
}

function date(value) {
  return value ? new Intl.DateTimeFormat('ru', {dateStyle:'short',timeStyle:'short'}).format(new Date(value)) : '—';
}

function duration(seconds) {
  if (seconds === null) return '—';
  return seconds < 60 ? seconds + ' с' : Math.floor(seconds/60) + ' мин ' + (seconds%60) + ' с';
}

async function copyLink(url, status, field) {
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = 'Ссылка скопирована.';
  } catch {
    if (field) {
      field.focus();
      field.select();
      status.textContent = 'Скопируйте выделенную ссылку.';
    } else {
      status.textContent = 'Скопируйте ссылку из поля выше.';
    }
  }
}

function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[\t\r\n=+\-@]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

function exportCsv(rows) {
  const values = [['ID','Участник','Статус','Ответы','Верно','Всего','Приглашён','Открыл игру','Завершил','Длительность (с)'],
    ...rows.map(p => [p.id,p.name,labels[p.status],p.answered,p.correct,p.total,p.createdAt,p.openedAt,p.finishedAt,p.durationSeconds])];
  const content = '\ufeff' + values.map(row => row.map(csvCell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], {type:'text/csv;charset=utf-8'}));
  const link = element('a');
  link.href = url; link.download = 'etnohod-hackathon.csv'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dashboard(initial) {
  section('<section class="stack"><div><div class="heading"><div><h1>Кабинет учителя</h1><p class="muted">В гостях у Данияра · 3 вопроса</p></div><button id="logout" class="btn alt">Выйти</button></div><div class="stats"><div class="stat"><strong id="all-count">0</strong><span>Приглашено</span></div><div class="stat"><strong id="open-count">0</strong><span>Открыли игру</span></div><div class="stat"><strong id="done-count">0</strong><span>Завершили</span></div></div></div><section class="card"><h2>Пригласить участника</h2><form id="invite-form" class="create-fields"><div><label for="participant-name">Имя или псевдоним</label><input id="participant-name" required maxlength="60" placeholder="Например, Участник 1"></div><button class="btn gold">Создать ссылку</button></form><div class="invite" id="invite-link" hidden><label for="share-url" id="share-label"></label><div class="actions"><input id="share-url" readonly><button type="button" class="btn" id="copy-new">Копировать</button></div></div><p id="invite-status" class="status" role="status"></p><p id="invite-error" class="error" role="status"></p></section><section class="card"><div class="heading"><h2>Прогресс участников</h2><div class="actions"><button class="btn alt" id="refresh">Обновить</button><button class="btn alt" id="export">Скачать CSV</button></div></div><p id="table-error" class="error" role="status"></p><div class="table-wrap"><table><thead><tr><th scope="col">Участник</th><th scope="col">Статус</th><th scope="col">Прогресс</th><th scope="col">Верно</th><th scope="col">Завершил</th><th scope="col">Время</th><th scope="col">Приглашение</th></tr></thead><tbody id="people"></tbody></table></div></section></section>');
  const $ = id => document.getElementById(id);
  let rows = [];
  let signature;
  let refreshing = false;
  const urlFor = p => new URL(p.invitePath,location.origin).href;
  const showLink = p => {
    $('invite-link').hidden = false;
    $('share-label').textContent = 'Ссылка для ' + p.name;
    $('share-url').value = urlFor(p);
  };
  function draw(participants) {
    const next = JSON.stringify(participants);
    if (signature === next) return;
    signature = next;
    rows = participants;
    $('all-count').textContent = rows.length;
    $('open-count').textContent = rows.filter(p => p.openedAt).length;
    $('done-count').textContent = rows.filter(p => p.finishedAt).length;
    $('export').disabled = rows.length === 0;
    const list = $('people');
    list.replaceChildren();
    for (const p of rows) {
      const tr = element('tr');
      tr.append(element('td',p.name), element('td',labels[p.status]));
      const progress = element('td',p.answered + ' / ' + p.total);
      const bar = element('progress',undefined,'row-progress');
      bar.max = p.total; bar.value = p.answered;
      bar.setAttribute('aria-label','Ответов: ' + p.answered + ' из ' + p.total);
      progress.append(bar);
      tr.append(progress,element('td',String(p.correct)),element('td',date(p.finishedAt)),element('td',duration(p.durationSeconds)));
      const copy = element('button','Скопировать','btn alt');
      copy.addEventListener('click',() => {
        showLink(p);
        copyLink(urlFor(p),$('invite-status'),$('share-url'));
      });
      const cell = element('td'); cell.append(copy); tr.append(cell); list.append(tr);
    }
    if (!rows.length) {
      const empty = element('td','Приглашений пока нет.'); empty.colSpan = 7;
      const tr = element('tr'); tr.append(empty); list.append(tr);
    }
  }
  async function refresh() {
    if (refreshing || document.hidden) return;
    refreshing = true;
    try {
      const value = await api('/api/teacher/participants');
      draw(value.participants);
      setMessage($('table-error'));
    } catch (error) {
      if (error.status === 401) { clearInterval(timer); renderSignIn(error); }
      else setMessage($('table-error'),error);
    } finally { refreshing = false; }
  }
  draw(initial.participants);
  const timer = setInterval(refresh,4000);
  $('refresh').addEventListener('click',refresh);
  $('export').addEventListener('click',() => exportCsv(rows));
  $('copy-new').addEventListener('click',() => copyLink($('share-url').value,$('invite-status'),$('share-url')));
  $('logout').addEventListener('click',async () => {
    try { await api('/api/teacher/logout',{}); clearInterval(timer); renderSignIn(); }
    catch (error) { setMessage($('table-error'),error); }
  });
  $('invite-form').addEventListener('submit',async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    const input = $('participant-name');
    button.disabled = true;
    setMessage($('invite-error'));
    $('invite-status').textContent = '';
    try {
      const {participant} = await api('/api/teacher/participants',{name:input.value});
      draw([participant,...rows.filter(p => p.id !== participant.id)]);
      showLink(participant);
      $('invite-status').textContent = 'Приглашение создано.';
      input.value = '';
      await refresh();
    } catch (error) { setMessage($('invite-error'),error); }
    finally { button.disabled = false; }
  });
}

async function loadCabinet() {
  try { dashboard(await api('/api/teacher/participants')); }
  catch (error) { renderSignIn(error.status === 401 ? undefined : error); }
}

function playFrame() {
  return section('<section class="game"><header class="art"><p>Башкортостан</p><h1>В гостях у Данияра</h1></header><div class="play" id="play-content"></div></section>').querySelector('#play-content');
}

async function playGame() {
  const token = location.hash.slice(1);
  const pane = playFrame();
  const errorLine = element('p',undefined,'error');
  if (!token) {
    pane.append(element('p','Откройте персональную ссылку, которую прислал учитель.'));
    return;
  }
  async function open() {
    pane.replaceChildren(element('p','Открываем игру…','muted'));
    try { draw(await api('/api/play/open',{token})); }
    catch (error) {
      const button = element('button','Попробовать ещё раз','btn alt');
      button.addEventListener('click',open);
      pane.replaceChildren(element('p',error.message,'error'),button);
    }
  }
  function draw(state) {
    const step = element('p', state.question ? 'Вопрос ' + (state.step + 1) + ' / ' + state.total : 'Игра завершена', 'step');
    const progress = element('progress');
    progress.max = state.total; progress.value = state.step;
    progress.setAttribute('aria-label','Пройдено ' + state.step + ' из ' + state.total);
    pane.replaceChildren(step,progress);
    const area = element('div',undefined,'choices');
    pane.append(area);
    if (!state.question) {
      area.append(element('h2','Рәхмәт, ' + state.name + '!'),element('p',state.correct + ' / ' + state.total,'score'),element('p','Верных ответов. Результат уже в кабинете учителя.'));
    } else {
      const question = element('h2',state.question.prompt);
      question.tabIndex = -1;
      area.append(question);
      state.question.options.forEach((option,choice) => {
        const button = element('button',option,'answer');
        button.lang = 'ba';
        button.addEventListener('click',async () => {
          area.querySelectorAll('button').forEach(control => control.disabled = true);
          setMessage(errorLine);
          try {
            draw(await api('/api/play/answer',{token,step:state.step,choice}));
            pane.querySelector('h2').focus({preventScroll:true});
          } catch (error) {
            setMessage(errorLine,error);
            area.querySelectorAll('button').forEach(control => control.disabled = false);
          }
        });
        area.append(button);
      });
    }
    if (state.last) {
      const feedback = element('p',(state.last.correct ? 'Верно! ' : 'Запомни: ') + state.last.note,'feedback');
      feedback.setAttribute('role','status');
      pane.append(feedback);
    }
    pane.append(errorLine);
    setMessage(errorLine);
  }
  await open();
}

async function start() {
  if (route === '/play') return playGame();
  if (route === '/teacher') {
    const key = new URLSearchParams(location.hash.slice(1)).get('key');
    if (!key) return loadCabinet();
    replaceHash();
    try { await api('/api/teacher/login',{key}); await loadCabinet(); }
    catch (error) { renderSignIn(error); }
    return;
  }
  section('<section class="card signin stack"><h1>Этноход</h1><p>Мини-игра по башкирскому языку для участников хакатона. Чтобы сыграть, откройте своё приглашение.</p><div><a class="btn" href="/teacher">Кабинет учителя</a></div></section>');
}
start();
`;
