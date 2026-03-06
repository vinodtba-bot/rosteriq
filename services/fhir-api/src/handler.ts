import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { isValidResourceType } from '@rosteriq/fhir-utils';

export const handleFhirRequest: APIGatewayProxyHandlerV2 = async (event) => {
  const path = event.rawPath ?? '';
  const method = event.requestContext?.http?.method ?? 'GET';

  if (method === 'GET' && path.match(/^\/([A-Za-z]+)(\/[A-Za-z0-9\-\.]+)?$/)) {
    const [, resourceType, idPart] = path.split('/');
    if (resourceType && isValidResourceType(resourceType)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/fhir+json' },
        body: JSON.stringify({
          resourceType,
          id: idPart?.replace(/^\//, '') ?? null,
          meta: { lastUpdated: new Date().toISOString() },
        }),
      };
    }
  }

  return {
    statusCode: 400,
    headers: { 'Content-Type': 'application/fhir+json' },
    body: JSON.stringify({
      resourceType: 'OperationOutcome',
      issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Unsupported request' }],
    }),
  };
};
