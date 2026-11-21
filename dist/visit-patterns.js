/* Each sample is an original 8×8 interpretation of a Bashkir geometric motif. */
const visitOrnaments = [
  {
    name: 'Зигзаг', color: 'gold',
    note: 'В башкирских узорах зигзаги складываются в полосы и обрамляют более крупные мотивы.',
    rows: ['........','..##....','.####...','###.##..','##...##.','......##','........','........'],
    pieces: ['square', 'tee', 'corner', 'zig', 'domino']
  },
  {
    name: 'Ступенчатый ромб', color: 'berry',
    note: 'Ромбы со ступенчатыми краями встречаются в башкирском ткачестве и вышивке.',
    rows: ['........','...##...','..####..','.######.','.######.','..####..','...##...','........'],
    pieces: ['zig', 'line', 'el', 'domino', 'square', 'zig', 'corner']
  },
  {
    name: 'Косой крест', color: 'jade',
    note: 'Косые кресты встречаются в геометрических узорах башкирских тканей и вышивок.',
    rows: ['##....##','###..###','.######.','..####..','..####..','.######.','###..###','##....##'],
    pieces: ['square', 'tee', 'corner', 'domino', 'zig', 'el', 'line', 'square', 'tee', 'corner', 'domino', 'corner']
  }
].map(ornament => ({ ...ornament, target: [...ornament.rows.join('')].map(cell => cell === '#') }));

const visitOrnamentShapes = {
  domino: ['Два блока', [[0,0],[0,1]]],
  line: ['Полоска', [[0,0],[0,1],[0,2]]],
  square: ['Квадрат', [[0,0],[0,1],[1,0],[1,1]]],
  corner: ['Уголок', [[0,0],[1,0],[1,1]]],
  el: ['Длинный уголок', [[0,0],[1,0],[2,0],[2,1]]],
  tee: ['Т-образная фигура', [[0,0],[0,1],[0,2],[1,1]]],
  zig: ['Ступенька', [[0,0],[0,1],[1,1],[1,2]]]
};

function visitOrnamentOffsets(shape, turn) {
  let cells = visitOrnamentShapes[shape][1];
  for (let i = 0; i < turn; i++) cells = cells.map(([row, col]) => [col, -row]);
  const top = Math.min(...cells.map(([row]) => row));
  const left = Math.min(...cells.map(([, col]) => col));
  return cells.map(([row, col]) => [row - top, col - left]);
}

function visitOrnamentCells(shape, turn, anchor) {
  const row = Math.floor(anchor / 8), col = anchor % 8;
  const cells = visitOrnamentOffsets(shape, turn).map(([dy, dx]) => [row + dy, col + dx]);
  return cells.every(([y, x]) => y < 8 && x < 8) ? cells.map(([y, x]) => y * 8 + x) : [];
}

function visitOrnamentState(s) {
  if (s.patterns?.version !== 2) {
    const finished = [0, 1].every(i => s.outfits?.[i]?.length === 3) || s.patterns?.ribbons >= 6;
    s.patterns = { version: 2, round: finished ? visitOrnaments.length : 0, placements: [] };
    if (finished) s.outfits = { 0: ['body', 'collar', 'hem'], 1: ['body', 'collar', 'hem'] };
  }
  return s.patterns;
}

function visitOrnamentSample(ornament) {
  return `<div class="orn-sample" data-color="${ornament.color}" aria-hidden="true">${ornament.target.map(filled =>
    `<i${filled ? ' class="orn-thread"' : ''}></i>`).join('')}</div>`;
}

function visitOrnamentPiece(shape, turn) {
  return `<span class="orn-piece-icon" aria-hidden="true">${visitOrnamentOffsets(shape, turn).map(([y, x]) =>
    `<i class="orn-thread" style="grid-area:${y + 1}/${x + 1}"></i>`).join('')}</span>`;
}

function renderVisitPatterns(u, s) {
  const state = visitOrnamentState(s);
  const ornament = visitOrnaments[state.round];
  if (!ornament) return `<section class="orn-workshop orn-complete">
    <h2 id="orn-title" tabindex="-1">Три узора готовы!</h2>
    <p>Наряды к празднику собраны. Можно продолжать путешествие.</p>
    <div class="orn-gallery">${visitOrnaments.map(item => `<figure>${visitOrnamentSample(item)}<figcaption>${item.name}</figcaption></figure>`).join('')}</div>
  </section>`;

  const used = new Set(state.placements.map(move => move.piece));
  const occupied = new Set(state.placements.flatMap(({piece, turn, anchor}) => visitOrnamentCells(ornament.pieces[piece], turn, anchor)));
  const selected = ornament.pieces.findIndex((_, i) => !used.has(i));
  return `<section class="orn-workshop" data-color="${ornament.color}" aria-labelledby="orn-title">
    <header class="orn-heading">
      <div><h2 id="orn-title" tabindex="-1">Мастерская узоров</h2>
      <p>Перетащи фигуру к нужному месту или выбери её и коснись поля.</p></div>
      <ol class="orn-rounds" aria-label="Узоры">${visitOrnaments.map((item, i) =>
        `<li${i === state.round ? ' aria-current="step"' : ''} aria-label="${item.name}${i < state.round ? ', готов' : ''}">${i < state.round ? '✓' : i + 1}</li>`).join('')}</ol>
    </header>
    <div class="orn-layout">
      <div class="orn-play">
        <div class="orn-board" role="group" aria-label="Поле 8 на 8. Клавиши со стрелками перемещают курсор">
          ${ornament.target.map((target, i) => `<button type="button" data-orn-cell="${i}" ${target ? 'data-target' : ''}
            class="${occupied.has(i) ? 'orn-thread' : ''}" tabindex="${i === 0 ? '0' : '-1'}"
            aria-label="Ряд ${Math.floor(i / 8) + 1}, столбец ${i % 8 + 1}${occupied.has(i) ? ', занят' : ''}"></button>`).join('')}
        </div>
      </div>
      <aside class="orn-reference">
        <div class="orn-reference-art">${visitOrnamentSample(ornament)}</div>
        <div class="orn-reference-copy"><p>Узор ${state.round + 1} из 3</p><h3>${ornament.name}</h3>
        <p class="orn-note">${ornament.note}</p></div>
      </aside>
      <div class="orn-actions">
        <div class="orn-tray" role="group" aria-label="Фигуры">
          ${ornament.pieces.map((shape, i) => `<button type="button" data-orn-piece="${i}" aria-label="${visitOrnamentShapes[shape][0]} ${i + 1}"
            aria-pressed="${i === selected}" ${used.has(i) ? 'disabled' : ''}>${visitOrnamentPiece(shape, 0)}</button>`).join('')}
        </div>
        <div class="orn-tools">
          <button type="button" data-orn-rotate>Повернуть ↻</button>
          <button type="button" data-orn-undo ${used.size ? '' : 'disabled'}>Отменить ход</button>
          <button type="button" data-orn-hint>Подсказать ход</button>
        </div>
        <p class="orn-status" role="status">Фигуры на поле: ${used.size} из ${ornament.pieces.length}</p>
      </div>
      <p class="orn-source"><a href="https://posredi.ru/knb_O_Ornament.html" target="_blank" rel="noopener">О башкирском орнаменте</a></p>
    </div>
  </section>`;
}

// Exact cover keeps hints valid even if the player finds a different tiling.
function visitOrnamentHint(ornament, occupied, remaining) {
  const holes = ornament.target.flatMap((target, i) => target && !occupied.has(i) ? [i] : []);
  const bit = i => 1n << BigInt(i);
  const maskOf = cells => cells.reduce((mask, i) => mask | bit(i), 0n);
  const options = holes.map(() => []);
  for (const shape of new Set(remaining.map(i => ornament.pieces[i]))) {
    const turns = new Set();
    for (let turn = 0; turn < 4; turn++) {
      const key = visitOrnamentOffsets(shape, turn).map(pair => pair.join()).sort().join(';');
      if (turns.has(key)) continue;
      turns.add(key);
      for (let anchor = 0; anchor < 64; anchor++) {
        const cells = visitOrnamentCells(shape, turn, anchor);
        if (!cells.length || !cells.every(i => ornament.target[i] && !occupied.has(i))) continue;
        const option = { shape, turn, anchor, mask: maskOf(cells) };
        for (const i of cells) options[holes.indexOf(i)].push(option);
      }
    }
  }
  function solve(mask, pieces) {
    if (!mask) return true;
    let choices;
    for (let i = 0; i < holes.length; i++) {
      if (!(mask & bit(holes[i]))) continue;
      const available = options[i].filter(move => (mask & move.mask) === move.mask && pieces.includes(move.shape));
      if (!available.length) return false;
      if (!choices || available.length < choices.length) choices = available;
      if (choices.length === 1) break;
    }
    return choices.find(move => {
      const next = pieces.slice();
      next.splice(next.indexOf(move.shape), 1);
      return solve(mask ^ move.mask, next);
    });
  }
  return solve(maskOf(holes), remaining.map(i => ornament.pieces[i]));
}

function wireVisitPatterns(u, s, redraw) {
  const root = document.querySelector('.orn-workshop:not(.orn-complete)');
  if (!root) return;
  const state = visitOrnamentState(s), ornament = visitOrnaments[state.round];
  const board = root.querySelector('.orn-board');
  const status = root.querySelector('.orn-status');
  const cells = [...board.querySelectorAll('button')];
  const pieces = [...root.querySelectorAll('[data-orn-piece]')];
  const occupied = new Set(cells.flatMap((cell, i) => cell.classList.contains('orn-thread') ? [i] : []));
  let selected = pieces.findIndex(button => !button.disabled);
  let turn = 0, anchor = null, drag, pinned = false, animating = false;

  function fits(index) {
    const projected = visitOrnamentCells(ornament.pieces[selected], turn, index);
    return projected.length > 0 && projected.every(i => ornament.target[i] && !occupied.has(i));
  }

  function snapTouch(x, y, exact = null) {
    const bounds = board.getBoundingClientRect();
    const reach = bounds.width / 8 * 1.45;
    let nearest = null;
    let distance = reach;
    if (pinned && anchor !== null && fits(anchor)) {
      const hint = cells[anchor].getBoundingClientRect();
      if (Math.hypot(x - hint.x - hint.width / 2, y - hint.y - hint.height / 2) < reach) return anchor;
    }
    if (exact !== null && fits(exact)) return exact;
    cells.forEach((cell, i) => {
      if (!fits(i)) return;
      const rect = cell.getBoundingClientRect();
      const offset = Math.hypot(x - rect.x - rect.width / 2, y - rect.y - rect.height / 2);
      if (offset < distance) {
        nearest = i;
        distance = offset;
      }
    });
    return nearest;
  }

  function preview(index) {
    anchor = index;
    const projected = index === null ? [] : visitOrnamentCells(ornament.pieces[selected], turn, index);
    const valid = projected.every(i => ornament.target[i] && !occupied.has(i));
    cells.forEach((cell, i) => {
      cell.classList.toggle('orn-preview', valid && projected.includes(i));
      cell.classList.toggle('orn-anchor', valid && projected.length > 0 && i === index);
      cell.classList.toggle('orn-blocked', (!valid && projected.includes(i)) || (!projected.length && i === index));
    });
  }

  function select(piece, rotation = 0) {
    pieces[selected].setAttribute('aria-pressed', 'false');
    pieces[selected].innerHTML = visitOrnamentPiece(ornament.pieces[selected], 0);
    selected = piece;
    turn = rotation;
    pieces[selected].setAttribute('aria-pressed', 'true');
    pieces[selected].innerHTML = visitOrnamentPiece(ornament.pieces[selected], turn);
  }

  function place(index) {
    if (animating) return;
    const projected = visitOrnamentCells(ornament.pieces[selected], turn, index);
    if (!fits(index)) {
      visitGameError(u, 'patterns', 'blocked-placement');
      status.textContent = 'Фигура здесь не помещается. Попробуй повернуть её или выбери другие клетки.';
      preview(index);
      return;
    }
    state.placements.push({piece: selected, turn, anchor: index});
    if (state.placements.length < ornament.pieces.length) {
      redraw(`[data-orn-cell="${index}"]`);
      return;
    }

    animating = true;
    state.round++;
    state.placements = [];
    if (state.round === visitOrnaments.length) {
      s.outfits = { 0: ['body', 'collar', 'hem'], 1: ['body', 'collar', 'hem'] };
    }
    save();
    preview(null);
    status.textContent = `${ornament.name} — узор собран!`;
    root.querySelectorAll('button').forEach(button => { button.disabled = true; });
    for (const i of projected) cells[i].classList.add('orn-thread');
    ornament.target.forEach((filled, i) => {
      if (!filled) return;
      const x = i % 8 - 3.5, y = Math.floor(i / 8) - 3.5;
      cells[i].style.setProperty('--burst-x', `${x * 22}px`);
      cells[i].style.setProperty('--burst-y', `${y * 16 + 32}px`);
      cells[i].style.setProperty('--burst-spin', `${x * 15}deg`);
      cells[i].style.setProperty('--burst-delay', `${Math.round(Math.hypot(x, y) * 23)}ms`);
    });
    board.classList.add('orn-burst');
    const advance = () => { if (root.isConnected) redraw('#orn-title'); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) advance();
    else window.setTimeout(advance, 800);
  }

  function focusCell(index) {
    cells.find(cell => cell.tabIndex === 0)?.setAttribute('tabindex', '-1');
    cells[index].tabIndex = 0;
    cells[index].focus({preventScroll: true});
  }

  const focused = document.activeElement;
  if (focused?.matches('[data-orn-cell]')) focusCell(+focused.dataset.ornCell);

  board.addEventListener('pointerleave', () => { if (!pinned) preview(null); });
  cells.forEach((cell, i) => {
    cell.onclick = event => {
      const index = event.pointerType === 'touch' ? snapTouch(event.clientX, event.clientY, i) : i;
      place(index ?? i);
    };
    cell.onpointerenter = event => { if (event.pointerType !== 'touch' && !animating && !pinned) preview(i); };
    cell.onfocus = () => {
      cells.find(other => other !== cell && other.tabIndex === 0)?.setAttribute('tabindex', '-1');
      cell.tabIndex = 0;
      if (!animating && !pinned && cell.matches(':focus-visible')) preview(i);
    };
    cell.onkeydown = event => {
      const offsets = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: i % 8 ? -1 : 0, ArrowRight: i % 8 < 7 ? 1 : 0 };
      if (!(event.key in offsets)) return;
      event.preventDefault();
      pinned = false;
      focusCell(Math.max(0, Math.min(63, i + offsets[event.key])));
    };
  });
  pieces.forEach((button, i) => {
    button.onclick = () => {
      if (drag?.moved) return;
      pinned = false;
      if (selected !== i) select(i);
      preview(null);
    };
    button.onpointerdown = event => {
      if (!event.isPrimary || event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    };
    button.onpointermove = event => {
      if (drag?.pointer !== event.pointerId || (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7)) return;
      drag.moved = true;
      pinned = false;
      if (selected !== i) select(i);
      if (!drag.ghost) {
        drag.ghost = document.createElement('span');
        drag.ghost.className = 'orn-drag-piece';
        drag.ghost.setAttribute('aria-hidden', 'true');
        drag.ghost.innerHTML = visitOrnamentPiece(ornament.pieces[i], turn);
        root.append(drag.ghost);
      }
      drag.ghost.style.left = event.clientX + 'px';
      drag.ghost.style.top = event.clientY + 'px';
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-orn-cell]');
      const exact = target ? +target.dataset.ornCell : null;
      preview(event.pointerType === 'touch' ? snapTouch(event.clientX, event.clientY, exact) : exact);
    };
    button.onpointerup = event => {
      if (drag?.pointer !== event.pointerId) return;
      drag.ghost?.remove();
      if (drag.moved && anchor !== null) place(anchor);
      setTimeout(() => { if (drag?.pointer === event.pointerId) drag = null; }, 0);
    };
    button.onlostpointercapture = () => drag?.ghost?.remove();
    button.onpointercancel = () => {
      drag?.ghost?.remove();
      drag = null;
      preview(null);
    };
  });
  root.querySelector('[data-orn-rotate]').onclick = () => {
    pinned = false;
    select(selected, (turn + 1) % 4);
    preview(anchor);
    status.textContent = 'Фигура повёрнута.';
  };
  root.querySelector('[data-orn-undo]').onclick = () => {
    const move = state.placements.pop();
    redraw(`[data-orn-piece="${move.piece}"]`);
  };
  root.querySelector('[data-orn-hint]').onclick = () => {
    const remaining = pieces.flatMap((button, i) => button.disabled ? [] : [i]);
    const hint = visitOrnamentHint(ornament, occupied, remaining);
    if (!hint) {
      status.textContent = 'Из оставшихся фигур узор уже не сложить. Отмени один или несколько ходов.';
      return;
    }
    select(remaining.find(i => ornament.pieces[i] === hint.shape), hint.turn);
    pinned = true;
    preview(hint.anchor);
    status.textContent = 'Поставь выделенную фигуру рядом с подсветкой.';
    focusCell(hint.anchor);
    cells[hint.anchor].scrollIntoView({block: 'nearest', behavior: 'instant'});
  };
}
