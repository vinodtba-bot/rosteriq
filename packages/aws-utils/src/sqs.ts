import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from '@aws-sdk/client-sqs';

const client = new SQSClient({});

export interface SendMessageInput {
  queueUrl: string;
  body: string;
  messageGroupId?: string;
  messageDeduplicationId?: string;
  attributes?: Record<string, string>;
}

export async function sendMessage(input: SendMessageInput): Promise<string | undefined> {
  const result = await client.send(
    new SendMessageCommand({
      QueueUrl: input.queueUrl,
      MessageBody: input.body,
      MessageGroupId: input.messageGroupId,
      MessageDeduplicationId: input.messageDeduplicationId,
      MessageAttributes: input.attributes
        ? Object.fromEntries(
            Object.entries(input.attributes).map(([k, v]) => [
              k,
              { DataType: 'String', StringValue: v },
            ])
          )
        : undefined,
    })
  );
  return result.MessageId;
}

export async function sendMessageBatch(
  queueUrl: string,
  bodies: string[],
  messageGroupId?: string
): Promise<void> {
  const entries = bodies.slice(0, 10).map((body, i) => ({
    Id: `msg-${i}`,
    MessageBody: body,
    MessageGroupId: messageGroupId,
    MessageDeduplicationId: `${messageGroupId ?? 'default'}-${i}-${Date.now()}`,
  }));
  if (entries.length > 0) {
    await client.send(
      new SendMessageBatchCommand({ QueueUrl: queueUrl, Entries: entries })
    );
  }
}
