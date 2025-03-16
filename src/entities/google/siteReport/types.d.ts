declare namespace T {
    type GoogleSiteReport = {
      google_site_id: number
      site_id: number
      clicks: number
      impressions: number
      position: number
      date: Date
    }

    type GoogleAnalyticsRow = {
      url: Site['url']
    } & Pick<GoogleSiteReport, 'position' | 'impressions' | 'clicks' | 'date'>

    type GoogleSiteReportOutboxMessage = Pick<GoogleAccount, 'google_account_id'>
}
