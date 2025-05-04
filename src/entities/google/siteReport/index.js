import { SQL } from "sql-template-strings";
import db from "../../../libs/db.js";

class GoogleSiteReport {
  /**
   * @param {object} filters
   * @param {import('luxon').DateTime<true>} filters.startDate
   * @param {import('luxon').DateTime<true>} filters.endDate
   * @param {T.Transaction} [t]
   * @returns {Promise<T.GoogleAnalyticsRow[]>}
   */
  getAnalytics({ startDate, endDate }, t) {
    return db.query(
      SQL`
      select
        coalesce(min(gsr.position), 0) as position_min,
        coalesce(max(gsr.position), 0) as position_max,
        coalesce(sum(gsr.impressions), 0) as impressions,
        coalesce(sum(gsr.clicks), 0) as clicks,
        s.url as url,
        site_id
      from google_site s
      left join (
        select
          position, impressions, clicks, site_id
        from google_site_report
        where date >= ${startDate.toISODate()} and
          date <= ${endDate.toISODate()}
      ) gsr using (site_id)
      group by s.url, site_id
      limit 100
    `,
      t,
    );
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
        `;

    const values = reports.map(
      ({
        google_site_id: i,
        clicks: c,
        impressions: im,
        position: p,
        date: d,
        site_id: sid,
      }) => {
        return `(${i}, ${c}, ${im}, ${p}, '${d}', ${sid})`;
      },
    );

    query.append(values.join(","));
    query.append(SQL`on conflict (google_site_id, date)
      do update set clicks=excluded.clicks, impressions=excluded.impressions,
      position=excluded.position
    `);

    await db.run(query, t);
  }
}

export default new GoogleSiteReport();
