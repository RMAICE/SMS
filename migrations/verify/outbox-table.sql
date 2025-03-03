-- Verify sms:outbox-table on pg

BEGIN;

select
  message_id,
  message_body,
  created_at
from outbox
where false;

ROLLBACK;
