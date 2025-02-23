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
   * @returns {Promise<import('pg').QueryResult<Pick<T.Site, 'site_id'>>>}
   */
  async insertOne({ url }, t) {
    const query = SQL`
            insert into site (url) values (${url})
              on conflict do nothing
            returning site_id
        `

    return db.run(query, t)
  }
}

export default new Sites()
