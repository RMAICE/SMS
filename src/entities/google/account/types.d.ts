declare namespace T {
  type GoogleAccount = {
    google_account_id: string
    email: string
    refresh_token: string
    access_token: string
    scope: string
    expiry_date?: number
    photo?: string | null
    id_token?: string
  }
}
