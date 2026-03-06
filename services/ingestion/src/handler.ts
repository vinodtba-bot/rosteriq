import type { S3Handler, S3Event } from 'aws-lambda';
import { putEvent } from '@rosteriq/aws-utils';
import type { IngestionEvent } from '@rosteriq/shared-types';
import { randomUUID } from 'crypto';

export const onS3ObjectCreated: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const size = record.s3.object.size ?? 0;

    const payload: IngestionEvent = {
      id: randomUUID(),
      source: 'rosteriq.ingestion',
      time: new Date().toISOString(),
      'detail-type': 'RosterIQ.Ingestion.ObjectCreated',
      detail: {
        bucket,
        key,
        size,
        correlationId: record.responseElements?.['x-amz-request-id'],
      },
    };
    await putEvent(payload);
  }
};
