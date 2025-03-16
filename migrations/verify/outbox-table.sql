-- Verify sms:outbox-table on pg

BEGIN;

select
  message_id,
  message_body,
  message_queue,
  created_at
from outbox
where false;

ROLLBACK;
