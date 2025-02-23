import { SQL } from 'sql-template-strings'
import db from '#libs/db.js'

class Profiles {
  /**
   * @param {T.Transaction} [t]
   * @returns {Promise<T.Profile[]>}
   */
  getAll(t) {
    return db.query(SQL`select * from profile;`, t)
  }

  /**
   * @param {T.Profile['telegram_id']} telemgramId
   * @param {T.Transaction} [t]
   * @returns {Promise<T.Profile[]>}
   */
  getByTelegramId(telemgramId, t) {
    return db.get(SQL`select * from profile where telegram_id = ${telemgramId};`, t)
  }

  /**
   * @param {Omit<T.Profile, 'profile_id'>} site
   * @param {T.Transaction} [t]
   * @returns {Promise<import('pg').QueryResult<Pick<T.Profile, 'profile_id'>>>}
   */
  async insertOne({ first_name, last_name, username, telegram_id }, t) {
    const query = SQL`
      insert into profile (first_name, last_name, username, telegram_id)
        values (${first_name}, ${last_name}, ${username}, ${telegram_id})
      on conflict (telegram_id)
        do update set first_name=excluded.first_name, last_name=excluded.last_name,
          username=excluded.username
      returning (profile_id)
    `

    return db.run(query, t)
  }
}

export default new Profiles()
