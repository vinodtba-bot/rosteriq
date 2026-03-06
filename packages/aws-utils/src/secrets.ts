import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({});

let cache: Map<string, { value: string; expires: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getSecret(secretId: string): Promise<string> {
  const cached = cache.get(secretId);
  if (cached && cached.expires > Date.now()) return cached.value;

  const result = await client.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );
  const value =
    result.SecretString ??
    (result.SecretBinary
      ? Buffer.from(result.SecretBinary).toString('utf-8')
      : '');
  cache.set(secretId, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

export async function getSecretJson<T = Record<string, unknown>>(
  secretId: string
): Promise<T> {
  const raw = await getSecret(secretId);
  return JSON.parse(raw) as T;
}
