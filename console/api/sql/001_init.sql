-- PostgreSQL schema for lab-form submissions

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL,
  repeat_count INT NOT NULL
);

CREATE TABLE IF NOT EXISTS submission_answers (
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  PRIMARY KEY (submission_id, question_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_submission ON submission_answers (submission_id);
