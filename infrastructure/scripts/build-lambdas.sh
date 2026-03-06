#!/usr/bin/env bash
# Build all Lambda packages (TypeScript and Python) for CDK deploy.
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "Building workspace packages..."
pnpm install
pnpm run build

echo "Building Lambda services (TS)..."
for svc in ingestion validation compliance fhir-api analytics; do
  (cd "services/$svc" && pnpm run build)
done
echo "Lambda build complete."
