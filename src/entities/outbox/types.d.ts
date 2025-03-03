declare namespace T {
    type OutboxMessage = {
      message_id: number
      message_body: string
      created_at: Date
    }
}
