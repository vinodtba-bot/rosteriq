/** FHIR R4 related types (references) */

export type FHIRResourceType =
  | 'Organization'
  | 'Practitioner'
  | 'PractitionerRole'
  | 'HealthcareService'
  | 'Schedule'
  | 'Slot';

export interface FHIRReference {
  reference: string;
  type?: FHIRResourceType;
  display?: string;
}

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  profile?: string[];
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary';
  type?: { coding: Array<{ system: string; code: string }> };
  system?: string;
  value: string;
}
