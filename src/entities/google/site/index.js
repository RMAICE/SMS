import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class Sites {
  /**
     * @param {T.Transaction} [t]
     * @returns {Promise<T.GoogleSite[]>}
     */
  getAll(t) {
    return db.query(SQL`select * from google_site;`, t)
  }

  /**
     * @param {T.GoogleAccount} account
     * @param {T.Transaction} [t]
     * @returns {Promise<T.GoogleSite[]>}
     */
  getAllByAccount(account, t) {
    return db.query(SQL`
            select *
            from google_site
            where account_id = ${account.google_account_id}
        `, t)
  }

  /**
     * @param {T.Transaction} [t]
     * @returns {Promise<(T.GoogleSite & T.GoogleAccount)[]>}
     */
  getAllWithAccounts(t) {
    return db.query(SQL`
            select *
            from google_site
            inner join google_account using (google_account_id);`, t)
  }

  /**
     * @param {Omit<T.GoogleSite, 'google_site_id'>} site
     * @param {T.Transaction} [t]
     */
  async insertOne({ google_account_id, permissions, url, site_id }, t) {
    const query = SQL`
            INSERT INTO
                google_site (url, permissions, google_account_id, site_id)
            VALUES
                (${url}, ${permissions}, ${google_account_id}, ${site_id});
        `

    await db.run(query, t)
  }
}

export default new Sites()
