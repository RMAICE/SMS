import GoogleSiteReportWorkerQueue from '#entities/google/siteReport/queue.js'

async function main() {
  await GoogleSiteReportWorkerQueue.consumeMessage(async (msg) => {

  })
}

main()
