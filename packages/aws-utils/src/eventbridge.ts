import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import type { BaseEvent } from '@rosteriq/shared-types';

const client = new EventBridgeClient({});

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME ?? 'default';

export async function putEvent(event: BaseEvent): Promise<void> {
  await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: EVENT_BUS_NAME,
          Source: event.source,
          DetailType: event['detail-type'],
          Detail: JSON.stringify(event.detail),
          Time: event.time ? new Date(event.time) : undefined,
        },
      ],
    })
  );
}

export async function putEvents(events: BaseEvent[]): Promise<void> {
  if (events.length === 0) return;
  await client.send(
    new PutEventsCommand({
      Entries: events.map((e) => ({
        EventBusName: EVENT_BUS_NAME,
        Source: e.source,
        DetailType: e['detail-type'],
        Detail: JSON.stringify(e.detail),
        Time: e.time ? new Date(e.time) : undefined,
      })),
    })
  );
}
