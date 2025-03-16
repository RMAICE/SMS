import outbox from '#entities/outbox/index.js'
import WorkerQueue from '#libs/queue.js'

class GoogleSiteReportQueue extends WorkerQueue {
  get queue() {
    return 'GOOGLE_SITE_REPORT'
  }

  /**
     * @param {T.GoogleSiteReportOutboxMessage} siteReportMessage
     * @param {T.Transaction} [t]
     */
  async sendSiteReportOutboxMessage(siteReportMessage, t) {
    await outbox.insertOne({ message_body: JSON.stringify(siteReportMessage), message_queue: this.queue }, t)
  }
}

const GoogleSiteReportWorkerQueue = new GoogleSiteReportQueue()
export default GoogleSiteReportWorkerQueue
