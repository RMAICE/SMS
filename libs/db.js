// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from 'dotenv/config'
import sqlite from 'sqlite3'
import path from 'path'
import { SQL } from 'sql-template-strings'

const sqlite3 = sqlite.verbose()
const db = getNewDbConnection()

const init = SQL`
create table if not exists google_account (
  google_account_id text primary key not null,
  email text,
  photo text,
  access_token text not null,
  refresh_token text not null,
  id_token text,
  expiry_date num,
  scope text
);

create table if not exists google_site (
  google_site_id integer primary key,
  url text unique,
  permissions text not null,
  google_account_id text not null,
  site_id integer not null,
  foreign key (google_account_id)
    references google_account (google_account_id),
  foreign key (site_id)
    references site (site_id)
);

create table if not exists google_site_report (
  google_site_id int not null references google_site (google_site_id),
  clicks int default 0,
  impressions int default 0,
  position int default 0,
  date date not null,
  site_id integer not null references site (site_id),
  primary key (google_site_id, date)
);

create table if not exists binom_account (
  binom_account_id integer primary key not null,
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
  foreign key (binom_account_id) references binom_account (binom_account_id)
);

create table if not exists binom_campaign_report (
  binom_campaign_id text not null,
  url text not null,
  date date not null,
  clicks int default 0,
  site_id integer not null,
  primary key (binom_campaign_id, url, date),
  foreign key (binom_campaign_id) references binom_campaign (binom_campaign_id),
  foreign key (site_id) references site (site_id)
);

create table if not exists user (
  user_id integer primary key,
  first_name text,
  last_name text,
  username text,
  telegram_id text unique,
  photo_url text
);

create table if not exists site (
  site_id integer not null,
  user_id integer,
  url text not null unique,
  primary key (site_id, user_id),
  foreign key (user_id) references user (user_id)
);
`

db.serialize(() => {
  db.exec(init.sql)
})

class Db {
  /**
   * @param {import('sql-template-strings').SQLStatement} sql
   * @param {T.Transaction} [transaction]
   */
  query(sql, transaction) {
    const connection = transaction?.connection ?? db
    return new Promise((res, rej) => {
      connection.all(sql.text, sql.values, (err, rows) => {
        if (err) rej(err)
        res(rows)
      })
    })
  }

  /**
   * @param {import('sql-template-strings').SQLStatement} sql
   * @param {T.Transaction} [transaction]
   */
  get(sql, transaction) {
    const connection = transaction?.connection ?? db
    return new Promise((res, rej) => {
      connection.get(sql.text, sql.values, (err, row) => {
        if (err) rej(err)
        res(row)
      })
    })
  }

  /**
   * @param {import('sql-template-strings').SQLStatement} sql
   * @param {T.Transaction} [transaction]
   * @throws {Error}
   */
  run(sql, transaction) {
    const connection = transaction?.connection ?? db
    return (new Promise((res, rej) => {
      connection.run(sql.text, sql.values, function (err) {
        if (err)
          return rej(err)
        res(this.lastID)
      })
    }))
  }
}

export default new Db()

export function getNewDbConnection() {
  if (!process.env.DB_CONNECTION)
    throw new Error('No connection provided')

  return new sqlite3.Database(process.cwd() + path.resolve(process.env.DB_CONNECTION))
}
