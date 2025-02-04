import { getNewDbConnection } from '#libs/db.js'

/** @type {T.Transaction} */
class Transaction {
  constructor() {
    this.isStarted = false
    this.connection = getNewDbConnection()
  }

  /**
   * @returns {Promise<T.Transaction>}
   */
  begin() {
    return new Promise((res, rej) => {
      if (this.isStarted) {
        res(this)
        return
      }

      this.isStarted = true
      this.connection.run('BEGIN TRANSACTION', (err) => {
        if (err) rej(err)

        res(this)
      })
    })
  }

  /**
   * @returns {Promise<T.Transaction>}
   */
  commit() {
    return new Promise((res, rej) => {
      if (this.isStarted) {
        this.connection.run('COMMIT;', (err) => {
          if (err)
            rej(err)

          this.connection.close((err) => {
            if (err) rej(err)

            res(this)
          })
        })
        this.isStarted = false
        return
      }

      res(this)
    })
  }

  /**
   * @returns {Promise<T.Transaction>}
   */
  rollback() {
    return new Promise((res, rej) => {
      if (this.isStarted) {
        this.connection.run('ROLLBACK;', (err) => {
          if (err)
            rej(err)

          this.connection.close((err) => {
            if (err) rej(err)

            res(this)
          })
        })
        this.isStarted = false
        return
      }

      res(this)
    })
  }
}

export default async function transaction() {
  const transaction = new Transaction()

  return transaction
};
