#!/usr/bin/env bash
# Deploy Next.js apps to Vercel or AWS Amplify Hosting.
# Set DEPLOY_TARGET=vercel or DEPLOY_TARGET=amplify; default: print instructions.

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DEPLOY_TARGET="${DEPLOY_TARGET:-}"

if [ "$DEPLOY_TARGET" = "vercel" ]; then
  echo "Deploying to Vercel..."
  for app in web provider-portal admin; do
    (cd "apps/$app" && pnpm build && vercel --prod)
  done
  echo "Done. Configure Vercel project links and env in the dashboard."
elif [ "$DEPLOY_TARGET" = "amplify" ]; then
  echo "Deploying to AWS Amplify Hosting..."
  for app in web provider-portal admin; do
    (cd "apps/$app" && pnpm build)
    echo "Add apps/$app as an Amplify app (amplify add hosting) or use Amplify Console."
  done
  echo "Done. Push to connected branch to trigger Amplify build."
else
  echo "DEPLOY_TARGET not set. Skipping app deploy."
  echo "To deploy apps: DEPLOY_TARGET=vercel $0  or  DEPLOY_TARGET=amplify $0"
  exit 0
fi
