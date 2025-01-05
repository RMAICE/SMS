declare namespace T {
  type BinomCampaign = {
    binom_campaign_id: string
    binom_account_id: number
    name: string
  }

  type BinomCampaignDto = {
    id: string
    name: string
  }

  type BinomApiCampaignsParams = {
    page: 'Campaigns'
  }

  type BinomApiCampaignReportParams = {
    page: 'Stats'
    camp_id: string
    group1: string
    group2: string
    date_s: string
    date_e: string
    date: '12'
    /** limit per page */
    val_page: number
    /** page number */
    num_page: number
  }

  type BinomApiParams = BinomApiCampaignReportParams | BinomApiCampaignsParams

  type BinomCampaignsResponse = BinomCampaignDto[]
}
