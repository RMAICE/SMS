import { PoolClient } from 'pg'

declare global {
  namespace T {
    interface Transaction {
      connection: PoolClient | null
      commit(): Promise<Transaction>
      begin(): Promise<Transaction>
      rollback(): Promise<Transaction>
    }
  }
}
