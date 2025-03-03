-- Verify sms:init-state on pg

BEGIN;

select
  profile_id,
  first_name,
  last_name,
  username,
  telegram_id,
  photo_url
from profile
where false;

select
  site_id,
  profile_id,
  url
from site
where false;

select 
  google_account_id,
  email,
  photo,
  access_token,
  refresh_token,
  id_token,
  expiry_date,
  scope
from google_account
where false;

select
  google_site_id,
  permissions,
  google_account_id,
  site_id
from google_site
where false;

select
  google_site_id,
  clicks,
  impressions,
  position,
  date,
  site_id
from google_site_report
where false;

select
  binom_account_id,
  token,
  name,
  host,
  protocol
from binom_account
where false;

select
  binom_campaign_id,
  binom_account_id,
  name
from binom_campaign
where false;

select
  binom_campaign_id,
  url,
  date,
  clicks,
  site_id
from binom_campaign_report
where false;

ROLLBACK;
