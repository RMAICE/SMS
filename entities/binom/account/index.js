import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class BinomAccount {
  /**
   * @param {T.Transaction} [transaction]
   * @returns {Promise<T.BinomAccount[]>}
   */
  async getAll(transaction) {
    const query
            = SQL`select * from binom_account`

    const accounts = await db.query(query,
      transaction,
    )

    return accounts
  }

  /** @param {Omit<T.BinomAccount, 'binom_account_id'>} account
   * @param {T.Transaction} [transaction]
   */
  async insertOne(account, transaction) {
    const query = SQL`
            INSERT INTO
                binom_account (name, token, host, protocol)
            VALUES
                (${account.name}, ${account.token}, ${account.host},
                ${account.protocol})`

    await db.run(query, transaction)
  }
}

export default new BinomAccount()
