import type { EventBridgeHandler } from 'aws-lambda';
import { putEvent } from '@rosteriq/aws-utils';
import type { ValidationEvent } from '@rosteriq/shared-types';
import { randomUUID } from 'crypto';

export type ValidationDetail = {
  documentId: string;
  documentType: string;
  bucket?: string;
  key?: string;
};

export const validate: EventBridgeHandler<string, ValidationDetail, void> = async (event) => {
  const detail = event.detail;
  const passed = Boolean(detail.documentId && detail.documentType);
  const payload: ValidationEvent = {
    id: randomUUID(),
    source: 'rosteriq.validation',
    time: new Date().toISOString(),
    'detail-type': 'RosterIQ.Validation.Completed',
    detail: {
      documentId: detail.documentId,
      documentType: detail.documentType,
      status: passed ? 'passed' : 'failed',
      errors: passed ? undefined : ['Missing documentId or documentType'],
      correlationId: event.id,
    },
  };
  await putEvent(payload);
};
