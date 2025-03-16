declare namespace T {
    type OutboxMessage = {
      message_id: number
      message_body: string
      message_queue: string
      created_at: Date
    }
}
