import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class GoogleSite {
  /**
   * @param {T.Transaction} [t]
   * @returns {Promise<(T.GoogleSite & T.Site)[]>}
   */
  getAllSites(t) {
    return db.query(SQL`
      select *
      from google_site;`, t)
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
  async insertOne({ google_account_id, permissions, site_id, url }, t) {
    const query = SQL`
      insert into
        google_site (permissions, url, google_account_id, site_id)
      values
        (${permissions}, ${url}, ${google_account_id}, ${site_id});
    `

    await db.run(query, t)
  }
}

export default new GoogleSite()
