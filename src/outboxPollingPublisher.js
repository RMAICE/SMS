import GoogleSiteReportWorkerQueue from '#entities/google/siteReport/queue.js'
import outbox from '#entities/outbox/index.js'
import transaction from '#entities/transaction.js'

setInterval(async () => {
  try {
    const messages = await outbox.getAll()

    for (const message of messages) {
      const workerQueue = getWorkerQueue(message.message_queue)
      await workerQueue.sendMessage(message.message_body)
    }

    const trx = transaction()
    try {
      await trx.begin()

      await outbox.deleteMany(messages.map(({ message_id }) => message_id))
    }
    catch (e) {
      await trx.rollback()
      console.error(e)
    }
  }
  catch (e) {
    console.error(e)
  }
}, 30_000)

/**
  * @param {string} queue
  * @returns {import('#libs/queue.js').default}
  */
function getWorkerQueue(queue) {
  switch (queue) {
    case GoogleSiteReportWorkerQueue.queue:
      return GoogleSiteReportWorkerQueue

    default:
      throw new Error('unknown queue name')
  }
}
