import amqplib from 'amqplib'

class WorkerQueue {
  constructor() {
    /** @private */
    this.connection = null
    /** @private */
    this.channel = null
  }

  /**
   * @param {string} message
   */
  async sendMessage(message) {
    await this.init()

    await this.channel?.assertQueue(this.queue)

    return this.channel?.sendToQueue(this.queue, Buffer.from(message))
  }

  /**
   * @param {(message: import('amqplib').Message) => Promise<void> | void} fn
   */
  async consumeMessage(fn) {
    if (!fn) throw new Error('Function is not provided')

    await this.init()

    await this.channel?.assertQueue(this.queue, { durable: true })

    await this.channel?.consume(this.queue, async (message) => {
      if (!message) return

      console.log(`Queue "${this.queue}" has received message ${message.content.toString()}`)
      await fn(message)
    }, { noAck: true })

    console.log(`Consumer "${this.queue}" is ready to receive messages`)
  }

  /** @private */
  async init() {
    if (!this.connection) await this.initConnection()
    if (!this.channel) await this.initChannel()
  }

  /** @private */
  async initConnection() {
    this.connection = await amqplib.connect({
      username: process.env.RABBITMQ_DEFAULT_USER,
      password: process.env.RABBITMQ_DEFAULT_PASS,
      hostname: 'rabbit',
    })

    process.once('SIGINT', () => this.connection?.close())
  }

  /** @private */
  async initChannel() {
    this.channel = await this.connection?.createChannel()
  }

  /**
   * @abstract
   * @type {string}
   */
  get queue() {
    throw new Error('No queue is specified')
  }
}

export default WorkerQueue
