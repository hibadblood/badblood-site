-- badblood-join (8 Oct 2026): job applications for the 5 secretary roles. Private. Retention 6 months (cron purge in join-worker.js).
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  age INTEGER NOT NULL,
  roles TEXT NOT NULL,            -- JSON array of "01".."05" (max 2)
  phone TEXT NOT NULL,
  contact TEXT NOT NULL,          -- LINE ID or IG
  portfolio TEXT,                 -- optional https link
  intro TEXT NOT NULL,
  consent_at INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  ua TEXT
);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications(phone, created_at);
CREATE TABLE IF NOT EXISTS join_rl (ip_hash TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_join_rl ON join_rl(ip_hash, at);
