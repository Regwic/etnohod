const martenHints = {
  0: 'Прочитай приглашение Данияра и нажми «Продолжить».',
  1: 'Прочитай, чем предстоит помочь семье Данияра. Когда будешь готов, зайди на кухню.',
  2: 'Выбери продукт на карточке или перетащи его на рабочую поверхность. Если видишь кнопку действия, нажми её.',
  3: 'Сравни поле с образцом. Нажми «Подсказать ход», чтобы увидеть, куда поставить одну из фигур.',
  4: 'Выбери одну фразу и послушай запись. Под карточкой можно выбрать перевод.',
  5: 'Прочитай последнюю реплику и вопрос семьи. Выбери фразу, которая подходит к этой ситуации.',
  6: 'Открой пересказ и найди, что было сначала. После проверки верные кадры останутся на своих местах.',
  7: 'Выбери любое открытие, чтобы показать его гостю. После рассказа можно забрать подарки.',
  8: 'Сопоставь предмет с подписью места в комнате. Можно выбрать предмет и коснуться места или перетащить его.'
};

function martenButton(mode = 'hint') {
  return `<button type="button" class="marten-call" data-marten="${mode}" aria-haspopup="dialog">
    <img src="assets/marten-helper.png" alt="" width="36" height="36">
    <span>${mode === 'hint' ? 'Позвать куницу' : 'Поговорить с куницей'}</span>
  </button>`;
}

const martenConversations = new Map();
let martenOwner;

function openMarten(mode) {
  let dialog = document.querySelector('#marten-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'marten-dialog';
    dialog.setAttribute('aria-labelledby', 'marten-title');
    dialog.innerHTML = `<header class="marten-chat-header">
      <img src="assets/marten-helper.png" alt="" width="56" height="56">
      <div><h2 id="marten-title">Куница</h2><p data-marten-context></p></div>
      <button type="button" data-marten-close aria-label="Закрыть разговор">×</button>
    </header>
    <div class="marten-messages" role="log" aria-label="Разговор с куницей" aria-live="polite" aria-relevant="additions text"></div>
    <div class="marten-prompts" aria-label="Что спросить"></div>
    <form class="marten-form">
      <label for="marten-question">Твой вопрос</label>
      <div><input id="marten-question" type="text" maxlength="400" autocomplete="off" required>
        <button type="submit">Отправить</button></div>
      <small>Вопрос обрабатывает ИИ. Не пиши личные данные.</small>
    </form>`;
    dialog.querySelector('[data-marten-close]').onclick = () => dialog.close();
    document.body.append(dialog);
  }
  if (dialog.open) return;
  const story = document.querySelector('[data-marten-stage]');
  const stage = story ? Number(story.dataset.martenStage) : null;
  const taskSelectors = { 2: '#vk-step', 3: '.orn-reference h3', 4: '.visit-phrase h3', 5: '[data-marten-task]', 6: '#water-title', 8: '#room-title' };
  const currentHeading = taskSelectors[stage] ? story.querySelector(taskSelectors[stage]) : null;
  const task = currentHeading?.textContent.trim().slice(0, 160) ?? '';
  const name = stage === null ? 'Разговор' : STORY_STEPS[stage];
  const owner = user()?.id ?? null;
  if (owner !== martenOwner) {
    martenConversations.clear();
    martenOwner = owner;
  }
  const key = `${owner ?? 'guest'}:${mode === 'chat' ? 'chat' : `hint-${stage}`}`;
  const conversation = martenConversations.get(key) ?? { history: [], messages: [], pending: false };
  martenConversations.set(key, conversation);
  const log = dialog.querySelector('.marten-messages');
  const prompts = dialog.querySelector('.marten-prompts');
  const form = dialog.querySelector('.marten-form');
  const input = form.querySelector('input');
  const send = form.querySelector('button');
  dialog.querySelector('[data-marten-context]').textContent = mode === 'hint' ? `Подсказка · ${name}` : 'Разговор с ИИ-спутником';

  function renderMessage(role, text) {
    const line = document.createElement('p');
    line.dataset.speaker = role;
    line.textContent = text;
    log.append(line);
    log.scrollTop = log.scrollHeight;
    return line;
  }

  log.replaceChildren();
  if (!conversation.messages.length) {
    renderMessage('assistant', mode === 'hint'
      ? 'Я рядом. Что подсказать на этой остановке?'
      : 'Привет! О чём поговорим? Можно спросить про путешествие, животных, науку или что-нибудь ещё.');
  }
  for (const { role, text } of conversation.messages) renderMessage(role, text);
  send.disabled = conversation.pending;
  if (conversation.pending) renderMessage('status', 'Куница думает…');

  async function ask(question) {
    const message = question.trim();
    if (!message || conversation.pending) return;
    conversation.pending = true;
    send.disabled = true;
    input.value = '';
    conversation.messages.push({ role: 'user', text: message });
    renderMessage('user', message);
    const waiting = renderMessage('status', 'Куница думает…');
    let answer;
    let role = 'status';
    try {
      const response = await fetch('/api/marten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, stage, task, message, history: conversation.history }),
        signal: AbortSignal.timeout(15_000)
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && typeof data.answer === 'string') {
        answer = data.answer;
        role = 'assistant';
        conversation.history = [...conversation.history, { role: 'user', text: message }, { role, text: answer }].slice(-6);
      } else if (data.error === 'spam') {
        answer = 'Задай вопрос своими словами, без рекламы и ссылок.';
      } else if (response.status === 429) {
        answer = 'Сейчас лимит запросов исчерпан. Попробуй чуть позже.';
      } else if (data.error === 'unconfigured') {
        answer = 'ИИ-ответы пока не подключены.';
      }
    } catch {
      // A local hint remains available when the model request fails.
    } finally {
      answer ??= 'Сейчас куница не может ответить. Попробуй позже.';
      if (role === 'status' && mode === 'hint' && martenHints[stage] && answer !== 'Задай вопрос своими словами, без рекламы и ссылок.') {
        answer += `\n\nПодсказка по игре: ${martenHints[stage]}`;
      }
      conversation.messages.push({ role, text: answer });
      conversation.messages = conversation.messages.slice(-20);
      conversation.pending = false;
      if (dialog.dataset.conversation === key) {
        const indicator = waiting.isConnected ? waiting : log.querySelector('[data-speaker="status"]:last-child');
        indicator?.remove();
        renderMessage(role, answer);
        send.disabled = false;
      }
    }
  }

  form.onsubmit = event => {
    event.preventDefault();
    ask(input.value);
  };
  prompts.replaceChildren();
  const suggestions = mode === 'hint'
    ? ['Что делать дальше?']
    : ['Чем интересен Сабантуй?', 'Почему звёзды мерцают?', 'Что за зверь куница?'];
  for (const text of suggestions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.onclick = () => ask(text);
    prompts.append(button);
  }
  dialog.dataset.conversation = key;
  dialog.showModal();
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-marten]');
  if (button) openMarten(button.dataset.marten);
});
