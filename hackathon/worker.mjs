import { game } from './game.mjs';
import { html, client, styles } from './view.mjs';

const encoder = new TextEncoder();
const participantId = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const keyPattern = /^[A-Za-z0-9_-]{43}$/;
const digestPattern = /^[0-9a-f]{64}$/;
const teacherCookie = 'etnohod_hackathon_teacher';
const teacherLifetime = 60 * 60 * 24 * 7;
const total = game.questions.length;
const columns = 'id, name, created_at, opened_at, updated_at, finished_at, answered, correct, answers_json';
const security = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};

function reply(value, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...security, 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

function asset(value, type) {
  return new Response(value, { headers: { ...security, 'Content-Type': type } });
}

function fail(error, status) {
  return reply({ error }, status);
}

function encode64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decode64(value) {
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='), char => char.charCodeAt(0));
}

function importKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(secret, value) {
  return encode64(await crypto.subtle.sign('HMAC', await importKey(secret), encoder.encode(value)));
}

async function verify(secret, value, signature) {
  if (!keyPattern.test(signature ?? '')) return false;
  return crypto.subtle.verify('HMAC', await importKey(secret), decode64(signature), encoder.encode(value));
}

function cookie(value, age, secure) {
  return `${teacherCookie}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? '; Secure' : ''}`;
}

async function isTeacher(request, secret) {
  const raw = request.headers.get('Cookie')?.split(';').map(value => value.trim())
    .find(value => value.startsWith(teacherCookie + '='))?.slice(teacherCookie.length + 1);
  const [expiry, signature] = (raw ?? '').split('.');
  return /^\d{10}$/.test(expiry) && Number(expiry) > Date.now() / 1000 &&
    verify(secret, `teacher:${expiry}`, signature);
}

async function teacherLogin(body, secret, secure) {
  if (typeof body.key !== 'string' || !keyPattern.test(body.key)) return fail('Неверный ключ учителя.', 401);
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(body.key)));
  const digest = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const comparison = await sign(secret, digest);
  if (!await verify(secret, secret, comparison)) return fail('Неверный ключ учителя.', 401);

  const expiry = Math.floor(Date.now() / 1000) + teacherLifetime;
  const signature = await sign(secret, `teacher:${expiry}`);
  return reply({ ok: true }, 200, { 'Set-Cookie': cookie(`${expiry}.${signature}`, teacherLifetime, secure) });
}

async function participantSummary(row, secret) {
  const token = `${row.id}.${await sign(secret, `participant:${game.id}:${row.id}`)}`;
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    openedAt: row.opened_at,
    updatedAt: row.updated_at,
    finishedAt: row.finished_at,
    answered: row.answered,
    correct: row.correct,
    total,
    status: row.finished_at ? 'finished' : row.opened_at ? 'playing' : 'invited',
    durationSeconds: row.finished_at ? Math.max(0, Math.round((Date.parse(row.finished_at) - Date.parse(row.opened_at)) / 1000)) : null,
    invitePath: `/play#${token}`,
  };
}

function playerState(row) {
  const next = game.questions[row.answered];
  const answers = JSON.parse(row.answers_json);
  return {
    name: row.name,
    step: row.answered,
    correct: row.correct,
    total,
    question: next ? { prompt: next.prompt, options: next.options } : null,
    last: answers.at(-1) ?? null,
  };
}

async function readParticipant(db, id) {
  return db.prepare(`SELECT ${columns} FROM hackathon_participants WHERE id = ?`).bind(id).first();
}

async function participantRoute(path, body, env) {
  const [id, signature, extra] = (typeof body.token === 'string' ? body.token : '').split('.');
  if (!participantId.test(id) || extra !== undefined ||
      !await verify(env.TEACHER_KEY_HASH, `participant:${game.id}:${id}`, signature)) {
    return fail('Ссылка не найдена. Попросите учителя проверить приглашение.', 404);
  }

  const db = env.DB;
  let row = await readParticipant(db, id);
  if (!row) return fail('Ссылка не найдена. Попросите учителя проверить приглашение.', 404);

  const now = new Date().toISOString();
  if (path === '/api/play/open') {
    if (!row.opened_at) {
      row = await db.prepare(`UPDATE hackathon_participants SET opened_at = ?, updated_at = ?
        WHERE id = ? AND opened_at IS NULL RETURNING ${columns}`).bind(now, now, id).first() ?? await readParticipant(db, id);
    }
    return reply(playerState(row));
  }

  const { step, choice } = body;
  const question = Number.isInteger(step) ? game.questions[step] : null;
  if (!question || !Number.isInteger(choice) || choice < 0 || choice >= question.options.length) {
    return fail('Выберите один из вариантов на экране.', 400);
  }
  if (row.answered !== step) return reply(playerState(row));

  const correct = choice === question.correct;
  const answers = JSON.parse(row.answers_json);
  answers.push({ step, choice, correct, note: question.note });
  const updated = await db.prepare(`UPDATE hackathon_participants
    SET opened_at = COALESCE(opened_at, ?), updated_at = ?, finished_at = ?, answered = answered + 1,
        correct = correct + ?, answers_json = ?
    WHERE id = ? AND answered = ? RETURNING ${columns}`)
    .bind(now, now, step + 1 === total ? now : null, correct ? 1 : 0, JSON.stringify(answers), id, step).first();
  return reply(playerState(updated ?? await readParticipant(db, id)));
}

async function teacherRoute(request, path, body, env, url) {
  const secret = env.TEACHER_KEY_HASH;
  const secure = url.protocol === 'https:';
  if (path === '/api/teacher/login' && request.method === 'POST') return teacherLogin(body, secret, secure);
  if (!await isTeacher(request, secret)) return fail('Войдите в кабинет учителя.', 401);
  if (path === '/api/teacher/logout' && request.method === 'POST') {
    return reply({ ok: true }, 200, { 'Set-Cookie': cookie('', 0, secure) });
  }

  const db = env.DB;
  if (path === '/api/teacher/participants' && request.method === 'GET') {
    const { results } = await db.prepare(`SELECT ${columns} FROM hackathon_participants
      ORDER BY created_at DESC, id DESC`).all();
    return reply({ participants: await Promise.all(results.map(row => participantSummary(row, secret))), total });
  }

  if (path === '/api/teacher/participants' && request.method === 'POST') {
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    if (!name || name.length > 60) return fail('Введите имя или псевдоним длиной до 60 символов.', 400);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = await db.prepare(`INSERT INTO hackathon_participants (id, name, created_at)
      VALUES (?, ?, ?) RETURNING ${columns}`).bind(id, name, now).first();
    return reply({ participant: await participantSummary(row, secret) }, 201);
  }

  return fail('Страница не найдена.', 404);
}

async function fetch(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === 'GET') {
    if (path === '/' || path === '/teacher' || path === '/play') {
      return new Response(html, {
        headers: {
          ...security,
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
        },
      });
    }
    if (path === '/art.webp' && typeof heroImage !== 'undefined') {
      return asset(Uint8Array.from(atob(heroImage), char => char.charCodeAt(0)), 'image/webp');
    }
    if (path === '/hackathon.js') return asset(client, 'text/javascript; charset=utf-8');
    if (path === '/hackathon.css') return asset(styles, 'text/css; charset=utf-8');
  }
  if (!path.startsWith('/api/')) return fail('Страница не найдена.', 404);
  if (!digestPattern.test(env.TEACHER_KEY_HASH ?? '') || !env.DB) {
    return fail('Сервис пока не настроен.', 503);
  }
  try {
    let body = {};
    if (request.method === 'POST') {
      const origin = request.headers.get('Origin');
      if (origin !== url.origin || !request.headers.get('Content-Type')?.includes('application/json')) {
        return fail('Запрос отклонён.', 403);
      }
      const raw = await request.text();
      if (raw.length > 4096) return fail('Запрос слишком большой.', 413);
      try { body = JSON.parse(raw); } catch { return fail('Некорректный запрос.', 400); }
      if (!body || Array.isArray(body) || typeof body !== 'object') return fail('Некорректный запрос.', 400);
    }
    if (path.startsWith('/api/teacher/')) return await teacherRoute(request, path, body, env, url);
    if (request.method === 'POST' && (path === '/api/play/open' || path === '/api/play/answer')) {
      return await participantRoute(path, body, env);
    }
    return fail('Страница не найдена.', 404);
  } catch (error) {
    console.error('Hackathon API:', error instanceof Error ? error.message : 'unknown error');
    return fail('Не удалось сохранить данные. Попробуйте ещё раз.', 500);
  }
}

export default { fetch };
