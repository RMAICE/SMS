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
     * @returns {Promise<T.GoogleSite>}
     */
  getAllByAccount(account, t) {
    return db.query(SQL`
            select *
            from google_site
            where account_id = ${account.google_account_id}
        `, t)
  }

  /**
     * @param {T.GoogleSiteReport[]} reports
     * @param {T.Transaction} [t]
     */
  async insertMany(reports, t) {
    const query = SQL`
            INSERT INTO
                google_site_report (
                    google_site_id, clicks, impressions, position, date, site_id
                )
            VALUES
        `

    const values = reports.map(({
      google_site_id: i, clicks: c, impressions: im,
      position: p, date, site_id: sid,
    }) => {
      const d = date.toISOString()
      return `(${i}, ${c}, ${im}, ${p}, '${d}', ${sid})`
    })

    query.append(values.join(','))
    query.append(SQL`on conflict (google_site_id, date)
      do update set clicks=excluded.clicks, impressions=excluded.impressions,
      position=excluded.position
    `)

    await db.run(query, t)
  }
}

export default new Sites()
