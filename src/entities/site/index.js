import { SQL } from 'sql-template-strings'
import db from '#libs/db.js'

class Sites {
  /**
   * @param {T.Transaction} [t]
   * @returns {Promise<T.Site[]>}
   */
  getAll(t) {
    return db.query(SQL`select * from site;`, t)
  }

  /**
   * @param {Omit<T.Site, 'site_id'>} site
   * @param {T.Transaction} [t]
   * @returns {Promise<number>}
   */
  async insertOne({ url }, t) {
    const query = SQL`
            insert into site (url) values (${url})
                on conflict do nothing
        `

    return db.run(query, t)
  }
}

export default new Sites()
