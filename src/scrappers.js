import GoogleSiteReportWorkerQueue from '#entities/google/siteReport/queue.js'
import GoogleAccount from '#entities/google/account/index.js'
import { fetchSitesAnalytics } from '#modules/integrations/scrappers/googleSiteReport.js'

async function main() {
  await GoogleSiteReportWorkerQueue.consumeMessage(async (msg) => {
    /** @type {T.GoogleSiteReportOutboxMessage} */
    const messageBody = JSON.parse(msg.content.toString())
    const account = await GoogleAccount.getById(messageBody.google_account_id)

    await fetchSitesAnalytics({ account })
  })
}

main()

process.on('uncaughtException', (e) => {
  console.error(e)
})
