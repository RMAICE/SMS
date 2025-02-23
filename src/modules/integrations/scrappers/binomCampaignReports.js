import { getOrCreateSiteId } from '#libs/site.js'
import binomAccount from '#entities/binom/account/index.js'
import binomCampaign from '#entities/binom/campaign/index.js'
import
binomCampaignReport from '#entities/binom/campaignReport/index.js'
import BinomClient from '#libs/binom.js'

getBinomCampaigns()

async function getBinomCampaigns() {
  const accounts = await binomAccount.getAll()

  for (const account of accounts) {
    await getReportsFromAccount(account)
  }
}

/**
 * @param {T.BinomAccount} account
 */
async function getReportsFromAccount(account) {
  const campaigns = await binomCampaign.getAllByAccountId(account.binom_account_id)

  for (const campaign of campaigns) {
    await fetchReportsFromCampaign(campaign, account)
  }
}

/**
 * @param {T.BinomCampaign} campaign
 * @param {T.BinomAccount} account
 */
async function fetchReportsFromCampaign(campaign, account) {
  const client = new BinomClient(account)
  const dateFrom = new Date(Date.now() - (1000 * 60 * 60 * 24 * 28))
  const params = {
    dateFrom,
    limit: 2,
    skip: 0,
  }

  let domain
  for await (const report of client.getCampaignReports(campaign, params)) {
    if (report.level === '1') {
      domain = report.name
      continue
    }

    if (!domain || domain.toLowerCase() === 'unknown')
      continue

    const siteId = await getOrCreateSiteId({ domain })

    await binomCampaignReport.insertOne({
      binom_campaign_id: campaign.binom_campaign_id,
      url: domain,
      date: new Date(report.name),
      clicks: Number(report.clicks),
      site_id: siteId,
    })
  }
}
