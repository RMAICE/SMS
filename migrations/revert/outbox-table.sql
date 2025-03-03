-- Revert sms:outbox-table from pg

BEGIN;

drop table outbox cascade;

COMMIT;
