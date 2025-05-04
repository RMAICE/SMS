import account from "#entities/google/account/index.js";
import googleSite from "#entities/google/site/index.js";
import siteReport from "#entities/google/siteReport/index.js";
import google from "#libs/google.js";
import { DATE_FORMAT } from "#modules/google/sites/analytics.js";
import { DateTime } from "luxon";

export async function getSitesStats() {
  const accounts = await account.getAll();

  for (let acc of accounts) {
    await fetchSitesAnalytics({ account: acc });
  }
}

/**
 * @param {Object} param
 * @param {T.GoogleAccount} param.account
 * @returns {Promise<void>}
 */
export async function fetchSitesAnalytics({ account }) {
  const googleSites = await googleSite.getAllSites();
  const client = google.getWebmastersByAccount(account);

  for (let site of googleSites) {
    for await (let reportChunk of getSiteReports(client, site))
      await insertReports(site, reportChunk);
  }
}

/**
 * @param {import('googleapis').webmasters_v3.Webmasters} client
 * @param {T.GoogleSite & T.Site} site
 */
async function* getSiteReports(client, site) {
  let rowLimit = 2,
    startRow = 0;

  while (true) {
    const res = await client.searchanalytics.query({
      siteUrl: site.url,
      requestBody: {
        startDate: getStartDate(),
        endDate: getEndDate(),
        dimensions: ["date"],
        rowLimit,
        startRow,
      },
    });

    startRow += rowLimit;

    if (res.status !== 200)
      throw new Error(`google_site_id '${site.google_site_id}'`);
    if (!res.data.rows) break;

    if (res.data.rows.length) yield res.data.rows;

    if (res.data.rows.length < rowLimit) break;
  }
}

function getStartDate() {
  const date = new Date();
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 90),
  )
    .toISOString()
    .substring(0, 10);
}

function getEndDate() {
  const date = new Date();
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1),
  )
    .toISOString()
    .substring(0, 10);
}

/**
 * @param {import('googleapis').webmasters_v3.Schema$ApiDataRow[]} rows
 * @param {T.GoogleSite} site
 */
async function insertReports(site, rows) {
  const reports = rows.map((googleReport) => {
    if (!googleReport.keys?.[0]) throw new Error("no date");

    const date = DateTime.fromFormat(googleReport.keys[0], DATE_FORMAT, {
      zone: "America/Los_Angeles",
    });

    if (!date.isValid) throw new Error("unknown date");

    return {
      google_site_id: site.google_site_id,
      clicks: googleReport.clicks ?? 0,
      impressions: googleReport.impressions ?? 0,
      position: googleReport.position ?? 0,
      date: date.toISO(),
      site_id: site.site_id,
    };
  });

  await siteReport.insertMany(reports);
}
