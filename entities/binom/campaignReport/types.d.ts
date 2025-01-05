declare namespace T {
  type BinomCampaignReport = {
    binom_campaign_id: string
    url: string
    date: Date
    clicks: number
    site_id: number
  }

  type BinomCampaignReportDto = {
    name: string
    clicks: string
    level: '1' | '2'
  }

  type BinomCampaignsResponse = BinomCampaignDto[]
}
