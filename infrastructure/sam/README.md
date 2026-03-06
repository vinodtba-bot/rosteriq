# SAM local testing (no Docker)

1. From repo root, build Lambda outputs:
   ```bash
   pnpm run build
   cd services/fhir-api && pnpm run build && cd ../..
   ```

2. Build SAM (optional; for TypeScript Lambdas you may use `sam local invoke` with built assets):
   ```bash
   sam build --template template.yaml
   ```

3. Start local API:
   ```bash
   sam local start-api --template template.yaml --parameter-overrides EventBusName=default
   ```

Python Lambdas (agents, graph) work as-is. Node.js Lambdas require `dist/` and dependencies; use CDK deploy for full integration.
