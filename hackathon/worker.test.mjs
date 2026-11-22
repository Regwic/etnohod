import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import worker from './worker.mjs';

test('a teacher can invite two independent participants and see durable progress', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(await readFile(new URL('./migrations/0000_hackathon.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      return {
        bind: (...args) => ({ first: async () => sqlite.prepare(sql).get(...args) ?? null }),
        all: async () => ({ results: sqlite.prepare(sql).all() }),
      };
    },
  };
  const key = randomBytes(32).toString('base64url');
  const env = { DB, TEACHER_KEY_HASH: createHash('sha256').update(key).digest('hex') };
  const origin = 'https://hackathon.example';
  function request(path, { body, cookie, otherOrigin } = {}) {
    const headers = {};
    if (body) {
      headers.Origin = otherOrigin ?? origin;
      headers['Content-Type'] = 'application/json';
    }
    if (cookie) headers.Cookie = cookie;
    return worker.fetch(new Request(origin + path, {
      method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined,
    }), env);
  }

  const participants = '/api/teacher/participants';
  assert.equal((await request(participants)).status, 401);
  assert.equal((await request('/api/teacher/login', { body: { key }, otherOrigin: 'https://other.example' })).status, 403);
  assert.equal((await request('/api/teacher/login', { body: { key: randomBytes(32).toString('base64url') } })).status, 401);
  const login = await request('/api/teacher/login', { body: { key } });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('Set-Cookie'), /HttpOnly; SameSite=Strict; .*Secure/);
  const cookie = login.headers.get('Set-Cookie').split(';')[0];

  const first = await request(participants, { cookie, body: { name: 'Команда 1' } });
  const second = await request(participants, { cookie, body: { name: 'Команда 2' } });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  const { participant: alice } = await first.json();
  const { participant: bob } = await second.json();
  assert.notEqual(alice.invitePath, bob.invitePath);
  const token = alice.invitePath.split('#')[1];
  assert.equal((await request('/api/play/open', { body: { token: token.slice(0, -3) + '!!!' } })).status, 404);

  const open = await request('/api/play/open', { body: { token } });
  assert.equal((await open.json()).step, 0);
  const answer = (step, choice) => request('/api/play/answer', { body: { token, step, choice } });
  const firstAnswers = await Promise.all([answer(0, 1), answer(0, 1)]);
  assert.deepEqual(await Promise.all(firstAnswers.map(async value => (await value.json()).step)), [1, 1]);
  assert.equal((await (await request('/api/play/open', { body: { token } })).json()).step, 1);

  const mid = (await (await request(participants, { cookie })).json()).participants.find(p => p.id === alice.id);
  assert.equal(mid.status, 'playing');
  assert.equal(mid.answered, 1);
  await answer(1, 1);
  const complete = await (await answer(2, 2)).json();
  assert.equal(complete.question, null);
  assert.equal(complete.correct, 2);

  const latest = (await (await request(participants, { cookie })).json()).participants;
  const finished = latest.find(p => p.id === alice.id);
  const untouched = latest.find(p => p.id === bob.id);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.answered, 3);
  assert.equal(finished.correct, 2);
  assert.equal(untouched.status, 'invited');
  assert.equal(untouched.answered, 0);
  assert.equal((await request(participants, { cookie: teacherCookieFromWrongKey(cookie) })).status, 401);
});

function teacherCookieFromWrongKey(cookie) {
  return cookie.replace(/\..*$/, '.' + randomBytes(32).toString('base64url'));
}
