import googleApi from '#libs/google.js'
import googleAccount from '#entities/google/account/index.js'

export async function getAccountsPageData() {
  const url = googleApi.getAuthorizeUrl()
  const accounts = await googleAccount.getAll()

  return {
    addAccUrl: url,
    accounts,
  }
}
