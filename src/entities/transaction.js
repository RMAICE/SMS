import db from '#libs/db.js'

/** @type {T.Transaction} */
class Transaction {
  constructor() {
    this.isStarted = false
    this.connection = null
  }

  /**
   * @returns {Promise<T.Transaction>}
   */
  async begin() {
    if (this.isStarted) {
      return this
    }

    this.isStarted = true
    this.connection = await db.getConnection()
    this.connection.query('begin transaction')
    return this
  }

  /**
   * @returns {Promise<T.Transaction>}
   */
  async commit() {
    if (!this.connection)
      throw new Error('No connection to commit')

    if (this.isStarted) {
      await this.connection.query('commit')
      this.connection.release()
      this.isStarted = false
    }

    return this
  }

  /**
   * @returns {Promise<T.Transaction>}
   */
  async rollback() {
    if (!this.connection)
      throw new Error('No connection to rollback')
    if (this.isStarted) {
      await this.connection.query('rollback')
      this.connection.release()
      this.isStarted = false
    }

    return this
  }
}

export default async function transaction() {
  const transaction = new Transaction()

  return transaction
};
