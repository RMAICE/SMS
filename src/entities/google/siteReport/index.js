import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class GoogleSiteReport {
  /**
     * @param {T.Transaction} [t]
     * @returns {Promise<T.GoogleAnalyticsRow[]>}
     */
  getAnalytics(t) {
    return db.query(SQL`
      select
        round(avg(position), 2) as position, sum(impressions) as impressions, sum(clicks) as clicks, s.url as url, site_id
      from google_site_report
      left join site s using (site_id)
      where date between date_trunc('month', current_date) and current_date
      group by s.url, site_id
      limit 100
    `, t)
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

export default new GoogleSiteReport()
