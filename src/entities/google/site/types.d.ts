declare module T {
    type GoogleSite = {
        google_site_id: number;
        url: string;
        permissions?: string | null;
        google_account_id: string;
        site_id: number;
    }

    type SiteAddDTO = {
        account_id?: string;
        url?: string;
        name?: string;
    }
}
