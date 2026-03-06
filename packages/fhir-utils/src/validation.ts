import type { FHIRResourceType } from '@rosteriq/shared-types';

const R4_RESOURCE_TYPES: FHIRResourceType[] = [
  'Organization',
  'Practitioner',
  'PractitionerRole',
  'HealthcareService',
  'Schedule',
  'Slot',
];

export function isValidResourceType(type: string): type is FHIRResourceType {
  return R4_RESOURCE_TYPES.includes(type as FHIRResourceType);
}

export function validateResourceId(id: string): boolean {
  return /^[A-Za-z0-9\-\.]{1,64}$/.test(id);
}

export function buildReference(
  resourceType: FHIRResourceType,
  id: string
): string {
  if (!validateResourceId(id)) throw new Error(`Invalid FHIR id: ${id}`);
  return `${resourceType}/${id}`;
}

export function parseReference(reference: string): { type: string; id: string } | null {
  const match = reference.match(/^(\w+)\/(.+)$/);
  if (!match) return null;
  return { type: match[1], id: match[2] };
}
