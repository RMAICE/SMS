import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class BinomCampaignReport {
  /**
   * @param {T.BinomCampaignReport} report
   * @param {T.Transaction} [t]
   */
  async insertOne(report, t) {
    if (!report) return

    const {
      binom_campaign_id,
      clicks,
      date,
      url,
      site_id,
    } = report
    const d = date.toISOString()
    const query = SQL`
      insert into
        binom_campaign_report (
          binom_campaign_id, clicks, date, url, site_id
        )
      values (${binom_campaign_id}, ${clicks}, ${d}, ${url},
        ${site_id})
        on conflict (binom_campaign_id, date, url)
        do update set clicks=excluded.clicks
    `

    await db.run(query, t)
  }

  /**
   * @param {T.Transaction} [t]
   */
  async getUniqueUrls(t) {
    const query = SQL`
      select distinct url
      from binom_campaign_report
    `

    return db.query(query, t)
  }
}

export default new BinomCampaignReport()
