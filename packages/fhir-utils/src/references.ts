import type { FHIRReference, FHIRResourceType } from '@rosteriq/shared-types';
import { buildReference, parseReference } from './validation.js';

export function createReference(
  resourceType: FHIRResourceType,
  id: string,
  display?: string
): FHIRReference {
  return {
    reference: buildReference(resourceType, id),
    type: resourceType,
    display,
  };
}

export function resolveReference(reference: string): FHIRReference | null {
  const parsed = parseReference(reference);
  if (!parsed) return null;
  return {
    reference,
    type: parsed.type as FHIRResourceType,
  };
}
