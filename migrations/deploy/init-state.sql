-- Deploy sms:init-state to pg
-- requires: appschema

begin;

create table if not exists profile (
  profile_id serial primary key,
  first_name varchar(50),
  last_name varchar(50),
  username varchar(25),
  telegram_id text unique,
  photo_url text
);

create table if not exists site (
  site_id serial primary key,
  profile_id integer,
  url text not null unique,
  unique (site_id, profile_id),
  foreign key (profile_id) references profile
);

create table if not exists google_account (
  google_account_id text primary key,
  email varchar(50),
  photo text,
  access_token text not null,
  refresh_token text not null,
  id_token text,
  expiry_date integer,
  scope text
);

create table if not exists google_site (
  google_site_id serial primary key,
  permissions varchar(50) not null,
  url text not null unique,
  google_account_id text references google_account,
  site_id integer references site
);

create table if not exists google_site_report (
  google_site_id integer not null references google_site,
  clicks integer default 0,
  impressions integer default 0,
  position integer default 0,
  date date not null,
  site_id integer not null references site,
  primary key (google_site_id, date)
);

create table if not exists binom_account (
  binom_account_id serial primary key,
  token text unique not null,
  name text not null,
  host text not null,
  protocol text not null
);

create table if not exists binom_campaign (
  binom_campaign_id text not null,
  binom_account_id integer not null,
  name text unique,
  primary key (binom_campaign_id, binom_account_id),
  foreign key (binom_account_id) references binom_account
);

create table if not exists binom_campaign_report (
  binom_campaign_id text not null,
  binom_account_id integer not null,
  url text not null,
  date date not null,
  clicks integer default 0,
  site_id integer not null,
  primary key (binom_campaign_id, url, date),
  foreign key (binom_campaign_id, binom_account_id) references binom_campaign (binom_campaign_id, binom_account_id),
  foreign key (site_id) references site (site_id)
);

commit;
