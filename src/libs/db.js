// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from 'dotenv/config'
import pg from 'pg'

if (!process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD)
  throw new Error('No connection provided')

const { Pool } = pg
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'db',
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
    return connection.query(sql.text, sql.values)
  }

  getConnection() {
    return pool.connect()
  }
}

export default new Db()
