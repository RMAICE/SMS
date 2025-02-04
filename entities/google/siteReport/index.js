import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class Sites {
  /**
     * @param {T.Transaction} [t]
     * @returns {Promise<T.GoogleAnalyticsRow[]>}
     */
  getAnalytics(t) {
    return db.query(SQL`
      select 
        position, impressions, clicks, s.url as url, date
      from google_site_report
      left join site s using (site_id)
      where date between date('now', '-7 days', '1', 'start of day', 'utc') and date('now', '+1 day', 'start of day', 'utc')
      limit 100`, t)
  }

  /**
     * @param {T.GoogleSiteReport[]} reports
     * @param {T.Transaction} [t]
     */
  async insertMany(reports, t) {
    const query = SQL`
            insert into
                google_site_report (
                    google_site_id, clicks, impressions, position, date, site_id
                )
            values
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
