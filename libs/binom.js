import { hasKey, isObject, isString, isArray } from './util.js'

class BinomClient {
  /**
   * @param {T.BinomAccount} binomAccount
   */
  constructor(binomAccount) {
    this.credentials = binomAccount
  }

  /**
   * @returns {Promise<T.BinomCampaignsResponse>}
   */
  async getCampaigns() {
    const rows = await this._get({ page: 'Campaigns' })

    if (!isArray(rows))
      throw new Error('Campaigns is not an array')

    return rows.map((row) => {
      if (!isObject(row)
        || !hasKey('id', row)
        || !hasKey('name', row)
        || !isString(row.id)
        || !isString(row.name))
        throw new Error('Not a campaign')

      /** @type {T.BinomCampaignDto} */
      const result = {
        id: row.id,
        name: row.name,
      }

      return result
    })
  }

  /**
   * @param {T.BinomCampaign} campaign
   * @param {{ dateFrom: Date; limit: number; skip: number; }} dateFrom
   * @returns {AsyncGenerator<T.BinomCampaignReportDto, void, unknown>}
   */
  async *getCampaignReports(campaign, { dateFrom, limit = 100 }) {
    let skip = 0
    let hasNext = true
    while (hasNext) {
      const results = await this._get({
        page: 'Stats',
        camp_id: campaign.binom_campaign_id,
        group1: '24',
        group2: '31',
        date: '12',
        date_s: dateFrom.toISOString().substring(0, 10),
        date_e: new Date().toISOString().substring(0, 10),
        val_page: limit,
        num_page: (skip / limit) + 1,
      })

      if (results === null) break
      else if (!isArray(results))
        throw new Error('Campaign reports is not an array')

      for (const row of results) {
        if (typeof row !== 'object' || row === null
          || !hasKey('level', row)
          || !hasKey('name', row)
          || !hasKey('clicks', row)
          || !isString(row.name)
          || (row.level !== '1' && row.level !== '2')
          || !isString(row.clicks))
          throw new Error('Not a campaign')

        yield {
          name: row.name,
          level: row.level,
          clicks: row.clicks,
        }
      };

      hasNext = results.length === limit
      skip += limit
    }
  }

  /**
   * @param {T.BinomApiParams} params
   * @returns {Promise<unknown>}
   */
  async _get(params) {
    if (!this.credentials)
      throw new Error('no token')

    const { protocol, host, token } = this.credentials
    const url = new URL(`${protocol}//${host}`)
    url.searchParams.set('api_key', token)
    url.searchParams.set('date', '12')

    for (const [param, value] of Object.entries(params)) {
      url.searchParams.set(param, encodeURIComponent(value))
    }

    const destination = url.toString()
    const res = await fetch(destination)

    const r = await res.json()

    if (r === 'no_clicks') return null

    return r
  }
}

export default BinomClient
