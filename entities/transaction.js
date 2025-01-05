import sqlite from 'sqlite3'
import path from 'path'

if (!process.env.DB_CONNECTION)
  throw new Error('No connection provided')

const connectionStr = path.resolve(process.env.DB_CONNECTION)

/** @type {T.Transaction} */
class Transaction {
  constructor() {
    this.isStarted = false
    this.connection = new sqlite.Database(connectionStr)
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
