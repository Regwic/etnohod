const visitRooms = [
  {
    id: 'yurt',
    name: 'Башкирская юрта',
    detail: 'Летнее жилище с деревянной решёткой и войлочным покрытием.',
    source: 'https://museumrb.ru/novosti/bashkirskaja-jurta-zhurnal-mir-muzeja/',
    items: [
      { id: 'chest', name: 'Сундук', spot: 'Подставка у стены', x: 76, y: 56, use: 'В нём хранили одежду и вещи.' },
      { id: 'felt', name: 'Кошма', spot: 'Пол юрты', x: 34, y: 87, use: 'Утепляла пол юрты.' },
      { id: 'saddle', name: 'Седло', spot: 'Подставка у входа', x: 17, y: 68, use: 'Помогало всаднику держаться на лошади.' },
      { id: 'kumgan', name: 'Кумган', spot: 'Столик для умывания', x: 55, y: 78, use: 'Из него лили воду для умывания.' }
    ]
  },
  {
    id: 'house',
    name: 'Деревянный дом',
    detail: 'В доме готовили у печи, а на широком помосте из досок отдыхали.',
    source: 'https://kitaptar.bashkort.org/files/bashkiry.etnicheskaya_istoriya_i_traditsionnaya_kultura._ufa._2002.pdf',
    items: [
      { id: 'towel', name: 'Вышитое полотенце', spot: 'Крючок на стене', x: 85, y: 39, use: 'Украшало стены дома.' },
      { id: 'samovar', name: 'Самовар', spot: 'Стол для чаепития', x: 24, y: 75, use: 'В нём кипятили воду для чая.' },
      { id: 'pillow', name: 'Подушка', spot: 'Нары у стены', x: 75, y: 74, use: 'На ней было мягче спать.' },
      { id: 'cauldron', name: 'Казан', spot: 'Очаг', x: 16, y: 53, use: 'В нём варили еду над огнём.' }
    ]
  }
];

function visitRoomImage(id) {
  return `<img class="room-object" src="assets/rooms/${id}.png" alt="" width="176" height="140" draggable="false">`;
}

function visitRoomComplete(s, room) {
  return room.items.every(item => s.rooms?.placed?.[room.id]?.includes(item.id));
}

function visitRoomsComplete(s) {
  return visitRooms.every(room => visitRoomComplete(s, room));
}

function renderVisitRooms(s) {
  const index = s.rooms?.active === 1 && visitRoomComplete(s, visitRooms[0]) ? 1 : 0;
  const room = visitRooms[index];
  const placed = s.rooms?.placed?.[room.id] ?? [];
  const done = visitRoomComplete(s, room);
  return `<section class="rooms-workshop" aria-labelledby="room-title">
    <header class="rooms-header">
      <div><h2 id="room-title" tabindex="-1">${room.name}</h2><p>${room.detail}</p></div>
      <div class="room-tabs" role="group" aria-label="Локации">${visitRooms.map((entry, i) =>
        `<button type="button" data-room-index="${i}" aria-pressed="${i === index}" ${i === 1 && !visitRoomComplete(s, visitRooms[0]) ? 'disabled' : ''}>${i === 0 ? 'Юрта' : 'Дом'}</button>`).join('')}</div>
    </header>
    <div class="room-scene" data-room="${room.id}">
      <img class="room-backdrop" src="assets/rooms/${room.id === 'yurt' ? 'yurt-v2' : room.id}.webp" alt="" width="1000" height="600" draggable="false">
      ${[...room.items].sort((a,b) => a.y - b.y).map(item => {
        const found = placed.includes(item.id);
        return `<div class="room-position" data-room-object="${item.id}" style="--room-x:${item.x}%;--room-y:${item.y}%">
          ${found ? `<div class="room-placed" id="room-placed-${item.id}" tabindex="-1">
            <div class="room-fact"><strong>${item.name}</strong><span>${item.use}</span></div>
            ${visitRoomImage(item.id)}</div>` : `<button type="button" class="room-target" data-room-target="${item.id}">
            <span class="room-marker" aria-hidden="true"></span><span class="room-destination">${item.spot}</span></button>`}
        </div>`;
      }).join('')}
    </div>
    <div class="room-under">
      <p class="room-status" role="status">${done ? (index === 0 ? 'Все вещи в юрте на своих местах.' : 'Обе комнаты готовы. Можно идти дальше.') : 'Перетащи предмет или выбери его и нажми на место в комнате.'}</p>
      <span class="room-count">${placed.length} из ${room.items.length} на месте</span>
    </div>
    ${done ? (index === 0 ? '<button type="button" class="room-next" data-room-index="1">Перейти в деревянный дом →</button>' : '') :
      `<div class="room-tray" role="group" aria-label="Предметы">${room.items.map(item =>
        `<button type="button" data-room-item="${item.id}" aria-pressed="false" ${placed.includes(item.id) ? 'disabled' : ''}>
          ${visitRoomImage(item.id)}<span>${item.name}</span></button>`).join('')}</div>`}
    <p class="room-source"><a href="${room.source}" target="_blank" rel="noopener">О традиционном жилище</a></p>
  </section>`;
}

function wireVisitRooms(s, redraw) {
  const root = document.querySelector('.rooms-workshop');
  if (!root) return;
  s.rooms ??= { active: 0, placed: {} };
  const room = visitRooms.find(entry => entry.id === root.querySelector('[data-room]').dataset.room);
  const placed = (s.rooms.placed[room.id] ??= []);
  const targets = [...root.querySelectorAll('[data-room-target]')];
  const items = [...root.querySelectorAll('[data-room-item]:enabled')];
  const status = root.querySelector('.room-status');
  let selected = null;
  let drag = null;
  let suppressClick = false;

  function select(id) {
    selected = id;
    for (const button of items) button.setAttribute('aria-pressed', String(button.dataset.roomItem === id));
    status.textContent = `Выбран предмет «${room.items.find(item => item.id === id).name}». Найди его место.`;
  }

  function place(id) {
    if (!selected) {
      status.textContent = 'Сначала выбери предмет под комнатой.';
      return;
    }
    if (id !== selected) {
      status.textContent = 'Попробуй другое место. Сравни предмет с подписями в комнате.';
      return;
    }
    placed.push(id);
    redraw('#room-placed-' + id);
  }

  function dropTarget(x, y) {
    const direct = document.elementFromPoint(x, y)?.closest('[data-room-target]');
    if (direct) return direct;
    // Allow a small margin around each target for touch and pen releases.
    return targets.find(button => {
      const rect = button.getBoundingClientRect();
      return x >= rect.left - 10 && x <= rect.right + 10 && y >= rect.top - 10 && y <= rect.bottom + 10;
    });
  }

  function clearDrag() {
    drag?.ghost?.remove();
    drag = null;
    targets.forEach(button => button.classList.remove('room-over'));
  }

  root.querySelectorAll('[data-room-index]:enabled').forEach(button => {
    button.onclick = () => {
      s.rooms.active = Number(button.dataset.roomIndex);
      redraw('#room-title');
    };
  });
  targets.forEach(button => { button.onclick = () => place(button.dataset.roomTarget); });
  items.forEach(button => {
    const id = button.dataset.roomItem;
    button.onclick = () => { if (!suppressClick) select(id); };
    button.onpointerdown = event => {
      if (!event.isPrimary || event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
    };
    button.onpointermove = event => {
      if (drag?.pointer !== event.pointerId) return;
      if (!drag.ghost) {
        if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
        select(id);
        drag.ghost = button.querySelector('img').cloneNode();
        drag.ghost.classList.add('room-ghost');
        root.append(drag.ghost);
      }
      drag.ghost.style.left = event.clientX + 'px';
      drag.ghost.style.top = event.clientY + 'px';
      const target = dropTarget(event.clientX, event.clientY);
      targets.forEach(option => option.classList.toggle('room-over', option === target));
    };
    button.onpointerup = event => {
      if (drag?.pointer !== event.pointerId) return;
      const moved = !!drag.ghost;
      clearDrag();
      if (!moved) {
        if (event.pointerType === 'touch') select(id);
        return;
      }
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
      const target = dropTarget(event.clientX, event.clientY);
      if (target) place(target.dataset.roomTarget);
    };
    button.onpointercancel = button.onlostpointercapture = clearDrag;
  });
}
