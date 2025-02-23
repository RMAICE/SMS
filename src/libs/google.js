// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dotenv from 'dotenv/config'
import { google } from 'googleapis'
import jwt from 'jsonwebtoken'

const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/webmasters',
]

class googleApi {
  getAuthorizeUrl() {
    const oauth2Client = this.generateOAuth2Client()
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    })

    return authorizeUrl
  }

  /**
   * @param {string} url
   */
  async getToken(url) {
    const qs = new URL(url, 'http://localhost:9000').searchParams
    const code = qs.get('code')

    if (!code) throw new Error('code не найден')

    const oauth2Client = this.generateOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    if (!tokens.id_token) throw new Error('id_token не найден')

    return { tokens, userInfo: jwt.decode(tokens.id_token) }
  }

  /**
   * @param {T.GoogleAccount} account
   */
  getWebmastersByAccount(account) {
    return google.webmasters({
      version: 'v3',
      auth: this.getOauth2Client(account),
    })
  }

  /**
   * @private
   * @param {T.GoogleAccount} account
   */
  getOauth2Client(account) {
    const oauth2Client = this.generateOAuth2Client()

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
      access_token: account.access_token,
    })

    return oauth2Client
  }

  /**
   * @private
   */
  generateOAuth2Client() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )
  }
}

export default new googleApi()
