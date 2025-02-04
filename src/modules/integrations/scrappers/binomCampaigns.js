import binomAccount from '../../../entities/binom/account/index.js'
import binomCampaign from '../../../entities/binom/campaign/index.js'
import BinomClient from '../../../libs/binom.js'

getBinomCampaigns()

async function getBinomCampaigns() {
  const accounts = await binomAccount.getAll()

  for (const account of accounts) {
    const client = new BinomClient(account)

    const campaigns = await client.getCampaigns()

    const campaignsInsert = campaigns.map(({ id, name }) => ({
      binom_campaign_id: id,
      binom_account_id: account.binom_account_id,
      name,
    }))

    await binomCampaign.insertMany(campaignsInsert)
  }
}
