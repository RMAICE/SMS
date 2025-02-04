import { Database } from 'sqlite3'

declare global {
  namespace T {
    interface Transaction {
      connection: Database
      commit(): Promise<Transaction>
      begin(): Promise<Transaction>
      rollback(): Promise<Transaction>
    }
  }
}
