import { SQL } from 'sql-template-strings'
import db from '#libs/db.js'

class Users {
  /**
   * @param {T.Transaction} [t]
   * @returns {Promise<T.User[]>}
   */
  getAll(t) {
    return db.query(SQL`select * from user;`, t)
  }

  /**
   * @param {T.User['telegram_id']} telemgramId
   * @param {T.Transaction} [t]
   * @returns {Promise<T.User[]>}
   */
  getByTelegramId(telemgramId, t) {
    return db.get(SQL`select * from user where telegram_id = ${telemgramId};`, t)
  }

  /**
   * @param {Omit<T.User, 'user_id'>} site
   * @param {T.Transaction} [t]
   * @returns {Promise<number>}
   */
  async insertOne({ first_name, last_name, username, telegram_id }, t) {
    const query = SQL`
      insert into user (first_name, last_name, username, telegram_id)
        values (${first_name}, ${last_name}, ${username}, ${telegram_id})
      on conflict (telegram_id)
        do update set first_name=excluded.first_name, last_name=excluded.last_name,
          username=excluded.username
    `

    return db.run(query, t)
  }
}

export default new Users()
