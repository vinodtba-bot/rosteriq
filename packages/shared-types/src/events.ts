/** EventBridge / SQS event payloads */

export type EventSource =
  | 'rosteriq.ingestion'
  | 'rosteriq.validation'
  | 'rosteriq.compliance'
  | 'rosteriq.agents'
  | 'rosteriq.graph'
  | 'rosteriq.fhir'
  | 'rosteriq.analytics';

export interface BaseEvent {
  id: string;
  source: EventSource;
  time: string; // ISO 8601
  'detail-type': string;
  detail: Record<string, unknown>;
}

export interface IngestionEvent extends BaseEvent {
  source: 'rosteriq.ingestion';
  detail: {
    bucket: string;
    key: string;
    size: number;
    contentType?: string;
    correlationId?: string;
  };
}

export interface ValidationEvent extends BaseEvent {
  source: 'rosteriq.validation';
  detail: {
    documentId: string;
    documentType: string;
    status: 'passed' | 'failed';
    errors?: string[];
    correlationId?: string;
  };
}

export interface ComplianceEvent extends BaseEvent {
  source: 'rosteriq.compliance';
  detail: {
    rosterId: string;
    checkType: string;
    result: 'compliant' | 'non_compliant';
    findings?: string[];
    correlationId?: string;
  };
}

export type RosterIQEvent = IngestionEvent | ValidationEvent | ComplianceEvent;
