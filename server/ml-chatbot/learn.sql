CREATE TABLE IF NOT EXISTS learned_data (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  intent TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (text, intent)
);

CREATE TABLE IF NOT EXISTS unlabeled (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  guessed_intent TEXT,
  confidence REAL,
  created_at TIMESTAMP DEFAULT NOW()
);
