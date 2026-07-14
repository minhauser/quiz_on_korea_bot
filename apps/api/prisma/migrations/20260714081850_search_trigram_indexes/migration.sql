-- Enable trigram similarity search (idempotent; infra/docker/postgres/init.sql already
-- enables this on fresh containers, but existing dev databases may predate that).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes backing the search module's similarity() queries.
CREATE INDEX IF NOT EXISTS lessons_title_trgm_idx ON lessons USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS vocabulary_word_trgm_idx ON vocabulary USING GIN (word gin_trgm_ops);
CREATE INDEX IF NOT EXISTS vocabulary_translation_trgm_idx ON vocabulary USING GIN (translation gin_trgm_ops);
CREATE INDEX IF NOT EXISTS grammar_title_trgm_idx ON grammar USING GIN (title gin_trgm_ops);
