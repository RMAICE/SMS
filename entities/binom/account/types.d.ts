declare namespace T {
  type BinomAccount = {
    binom_account_id: number
    name: string
    token: string
    host: string
    protocol: string
  }

  type BinomAccountAddDto = Partial<
    Omit<
      BinomAccount,
      'binom_account_id' | 'host' | 'protocol'
    >> & { url?: string }
}
