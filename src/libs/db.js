// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from 'dotenv/config'
import pg from 'pg'

if (!process.env.DB_CONNECTION)
  throw new Error('No connection provided')

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION,
})

class Db {
  /**
   * @param {import('sql-template-strings').SQLStatement} sql
   * @param {T.Transaction} [transaction]
   */
  async query(sql, transaction) {
    const connection = transaction?.connection ?? pool
    const result = await connection.query(sql.text, sql.values)
    return result.rows
  }

  /**
   * @param {import('sql-template-strings').SQLStatement} sql
   * @param {T.Transaction} [transaction]
   */
  async get(sql, transaction) {
    const connection = transaction?.connection ?? pool
    const result = await connection.query(sql.text, sql.values)
    return result.rows[0] ?? null
  }

  /**
   * @param {import('sql-template-strings').SQLStatement} sql
   * @param {T.Transaction} [transaction]
   * @throws {Error}
   */
  async run(sql, transaction) {
    const connection = transaction?.connection ?? pool
    const result = await connection.query(sql.text, sql.values)
    return result.oid
  }

  getConnection() {
    return pool.connect()
  }
}

export default new Db()
