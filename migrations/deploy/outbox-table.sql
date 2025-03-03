-- Deploy sms:outbox-table to pg
-- requires: appschema

BEGIN;

create table if not exists outbox (
  message_id serial primary key,
  message_body text,
  created_at timestamp with time zone not null default now()
);

COMMIT;
