-- Enable pgvector extension (if not already)
create extension if not exists vector;

-- Drop and recreate with correct schema
drop table if exists documents;

create table documents (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding vector(384)
);

-- Tracks which source files have already been ingested, keyed by content hash
drop table if exists ingested_documents;

create table ingested_documents (
  id uuid primary key default gen_random_uuid(),
  file_hash text not null unique,
  filename text not null,
  status text not null default 'processing', -- 'processing' | 'completed' | 'failed'
  created_at timestamptz not null default now()
);

-- Required function for similarity search
create or replace function match_documents (
  query_embedding vector(384),
  match_count int default null,
  filter jsonb default '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
