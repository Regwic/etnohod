CREATE TABLE IF NOT EXISTS hackathon_participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  opened_at TEXT,
  updated_at TEXT,
  finished_at TEXT,
  answered INTEGER NOT NULL DEFAULT 0 CHECK (answered BETWEEN 0 AND 3),
  correct INTEGER NOT NULL DEFAULT 0 CHECK (correct BETWEEN 0 AND answered),
  answers_json TEXT NOT NULL DEFAULT '[]'
);
