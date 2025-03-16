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
   * @param {Pick<T.OutboxMessage, 'message_body' | 'message_queue'>} outboxMessage
   * @param {T.Transaction} [t]
   * @returns {Promise<import('pg').QueryResult<Pick<T.OutboxMessage, 'message_id'>>>}
   */
  async insertOne(outboxMessage, t) {
    const query = SQL`
            insert into outbox (message_body, message_queue) 
            values (${outboxMessage.message_body}, ${outboxMessage.message_queue})
              on conflict do nothing
            returning message_id;
        `

    return db.run(query, t)
  }

  /**
   * @param {T.OutboxMessage['message_id'][]} ids
   * @param {T.Transaction} [t]
   * @returns {Promise<import('pg').QueryResult | null>}
   */
  async deleteMany(ids, t) {
    if (!ids.length)
      return null

    const query = SQL`
        delete from outbox where message_id in (${ids.join(',')})
      `

    return db.run(query, t)
  }
}

export default new Outbox()
