import { SQL } from 'sql-template-strings'
import db from '../../../libs/db.js'

class GoogleAccount {
  /**
     * @param {T.GoogleAccount['google_account_id']} id
     * @param {T.Transaction} [transaction]
     * @returns {Promise<T.GoogleAccount>}
     */
  async getById(id, transaction) {
    const account = await db.get(
      SQL`select * from google_account where google_account_id = ${id}`,
      transaction,
    )

    return account
  }

  /**
     * @param {T.Transaction} [transaction]
     * @returns {Promise<T.GoogleAccount[]>}
     */
  async getAll(transaction) {
    const accounts = await db.query(
      SQL`select * from google_account`,
      transaction,
    )

    return accounts
  }

  /** @param {T.GoogleAccount} account
     * @param {T.Transaction} [transaction]
     */
  async insertOne(account, transaction) {
    const query = SQL`
            INSERT INTO
                google_account (google_account_id, email,
                    photo, access_token, refresh_token, scope)
            VALUES
                (${account.google_account_id},
                ${account.email},
                ${account.photo},
                ${account.access_token},
                ${account.refresh_token},
                ${account.scope})`

    await db.run(query, transaction)
  }
}

export default new GoogleAccount()
