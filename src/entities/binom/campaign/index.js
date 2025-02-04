import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class BinomCampaign {
  /**
   * @param {T.Transaction} [transaction]
   * @returns {Promise<T.BinomCampaign[]>}
   */
  async getAll(transaction) {
    const query = SQL`select * from binom_account`

    const accounts = await db.query(query, transaction)

    return accounts
  }

  /**
   * @param {T.BinomAccount['binom_account_id']} binomAccountId
   * @param {T.Transaction} [transaction]
   * @returns {Promise<T.BinomCampaign[]>}
   */
  async getAllByAccountId(binomAccountId, transaction) {
    const query = SQL`
      select *
      from binom_campaign
      where binom_account_id = ${binomAccountId}
    `

    const accounts = await db.query(query, transaction)

    return accounts
  }

  /**
     * @param {T.BinomCampaign[]} campaigns
     * @param {T.Transaction} [t]
     */
  async insertMany(campaigns, t) {
    if (!campaigns.length) return

    const query = SQL`
      INSERT INTO
        binom_campaign (
          binom_campaign_id, binom_account_id, name
        )
      VALUES
    `

    const values = campaigns.map(({
      binom_campaign_id: id,
      binom_account_id: acc_id,
      name,
    }) => {
      return `(${id}, ${acc_id}, '${name}')`
    })

    query.append(values.join(','))

    await db.run(query, t)
  }
}

export default new BinomCampaign()
