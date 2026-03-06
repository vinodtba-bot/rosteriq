import type { EventBridgeHandler } from 'aws-lambda';
import { putEvent } from '@rosteriq/aws-utils';
import type { ComplianceEvent } from '@rosteriq/shared-types';
import { randomUUID } from 'crypto';

export type ComplianceCheckDetail = {
  rosterId: string;
  checkType: string;
  payload?: Record<string, unknown>;
};

export const runComplianceCheck: EventBridgeHandler<
  string,
  ComplianceCheckDetail,
  void
> = async (event) => {
  const detail = event.detail;
  const result = detail.rosterId && detail.checkType ? 'compliant' : 'non_compliant';
  const payload: ComplianceEvent = {
    id: randomUUID(),
    source: 'rosteriq.compliance',
    time: new Date().toISOString(),
    'detail-type': 'RosterIQ.Compliance.CheckCompleted',
    detail: {
      rosterId: detail.rosterId,
      checkType: detail.checkType,
      result,
      findings: result === 'non_compliant' ? ['Missing rosterId or checkType'] : undefined,
      correlationId: event.id,
    },
  };
  await putEvent(payload);
};
