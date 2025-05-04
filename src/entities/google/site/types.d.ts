declare namespace T {
  type GoogleSite = {
    google_site_id: number;
    permissions?: string | null;
    url: string;
    google_account_id: string;
    site_id: number;
  };

  type GoogleSiteAnalyticsUrlQuery = {
    startDate?: string;
    endDate?: string;
    year?: string;
    week?: string;
    month?: string;
    viewType?: "week" | "month" | "custom" | string;
  };
}
