-- Revert sms:init-state from pg

BEGIN;

drop table profile cascade;

drop table site cascade;

drop table google_account cascade;

drop table google_site cascade;

drop table google_site_report cascade;

drop table binom_account cascade;

drop table binom_campaign cascade;

drop table binom_campaign_report cascade;

COMMIT;
