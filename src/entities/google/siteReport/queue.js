import WorkerQueue from '#libs/queue.js'

class GoogleSiteReportQueue extends WorkerQueue {
  get queue() {
    return 'GOOGLE_SITE_REPORT'
  }
}

const GoogleSiteReportWorkerQueue = new GoogleSiteReportQueue()
export default GoogleSiteReportWorkerQueue
