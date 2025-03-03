import { SQL } from 'sql-template-strings'
import db from '#libs/db.js'

class Outbox {
  /**
   * @param {T.Transaction} [t]
   * @returns {Promise<T.OutboxMessage[]>}
   */
  getAll(t) {
    return db.query(SQL`select * from outbox;`, t)
  }

  /**
   * @param {T.OutboxMessage['message_body']} message_body
   * @param {T.Transaction} [t]
   * @returns {Promise<import('pg').QueryResult<Pick<T.OutboxMessage, 'message_id'>>>}
   */
  async insertOne(message_body, t) {
    const query = SQL`
            insert into outbox (message_body) values (${message_body})
              on conflict do nothing
            returning message_id;
        `

    return db.run(query, t)
  }

  /**
   * @param {T.OutboxMessage['message_id'][]} ids
   * @param {T.Transaction} [t]
   * @returns {Promise<import('pg').QueryResult>}
   */
  async deleteMany(ids, t) {
    const query = SQL`
        delete from outbox where message_id in (${ids})
      `

    return db.run(query, t)
  }
}

export default new Outbox()
