# RosterIQ™

Production-ready **serverless monorepo** on AWS: provider roster management, compliance, and FHIR-aligned APIs.

## Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | pnpm workspaces |
| **Frontend** | Next.js 14 (App Router) — Web, Provider Portal, Admin |
| **Hosting** | Vercel or AWS Amplify Hosting |
| **Backend** | AWS Lambda (TypeScript) — ingestion, validation, compliance, FHIR API, analytics |
| **AI/ML** | Python Lambda + LangGraph (agents), Python Lambda + Neptune (graph) |
| **Infrastructure** | AWS CDK (TypeScript) |
| **Database** | Amazon RDS Aurora Serverless v2 (PostgreSQL) + Prisma ORM |
| **Cache** | Amazon ElastiCache Serverless (Redis) |
| **Events** | Amazon EventBridge + SQS (replaces Kafka) |
| **Orchestration** | AWS Step Functions |
| **Local Lambda** | AWS SAM (no Docker required) |
| **CI/CD** | GitHub Actions → AWS |

---

## Project structure

```
rosteriq/
├── apps/
│   ├── web/                 # Next.js — main web app (Amplify/Vercel)
│   ├── provider-portal/      # Next.js — provider portal
│   └── admin/                # Next.js — admin dashboard
├── services/
│   ├── ingestion/            # Lambda + S3 triggers
│   ├── validation/           # Lambda (EventBridge)
│   ├── compliance/            # Lambda (EventBridge)
│   ├── agents/               # Python Lambda + LangGraph
│   ├── graph/                # Python Lambda + Neptune
│   ├── fhir-api/             # Lambda + API Gateway
│   └── analytics/            # Lambda + Athena
├── packages/
│   ├── shared-types/         # Shared TypeScript types
│   ├── aws-utils/             # AWS SDK helpers
│   ├── fhir-utils/            # FHIR R4 utilities
│   └── db/                    # Prisma + Aurora schema
├── infrastructure/
│   ├── cdk/                   # AWS CDK stacks
│   └── scripts/               # Deployment scripts
└── .github/workflows/         # CI/CD
```

---

## Prerequisites

- **Node.js** 18+ (20 recommended)
- **pnpm** 8+
- **AWS CLI** v2, configured
- **AWS CDK** CLI: `npm i -g aws-cdk`
- **SAM CLI** (optional, for local Lambda): [Install SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

---

## AWS setup (IAM & credentials)

### 1. IAM user or role for CDK/CLI

Create an IAM user (or use an existing one) with programmatic access and attach a policy that allows:

- CloudFormation (create/update stacks)
- Lambda, API Gateway, S3, EventBridge, SQS, IAM (create roles, attach policies)
- (Optional) RDS, ElastiCache, Step Functions, Athena

Example minimal policy names (attach as needed):

- `AdministratorAccess` (dev only), or
- Custom policy with: `cloudformation:*`, `lambda:*`, `apigateway:*`, `s3:*`, `events:*`, `sqs:*`, `iam:*`, `logs:*`, `athena:*`, `rds:*`, `elasticache:*`, `states:*`

### 2. Configure AWS CLI

```bash
aws configure
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region: us-east-1
```

Or use environment variables:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
```

### 3. Bootstrap CDK (once per account/region)

```bash
cd infrastructure/cdk
pnpm install
pnpm exec cdk bootstrap
```

### 4. GitHub Actions (CI/CD)

In the repo **Settings → Secrets and variables → Actions**, add:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID` (12-digit account ID)
- (Optional) `VERCEL_TOKEN` for app deploy workflow

---

## One-command deployment

From the **repository root**:

```bash
pnpm install
pnpm run deploy
```

This runs:

1. **`deploy:infra`** — `cd infrastructure/cdk && pnpm run cdk:deploy` (all CDK stacks)
2. **`deploy:apps`** — `infrastructure/scripts/deploy-apps.sh` (requires `DEPLOY_TARGET` set)

To deploy **only infrastructure**:

```bash
pnpm run deploy:infra
```

To deploy **only Next.js apps** (after setting target):

```bash
export DEPLOY_TARGET=vercel   # or amplify
pnpm run deploy:apps
```

---

## Local development

```bash
# Install
pnpm install

# Build all packages and services
pnpm run build

# Run Next.js apps (each in its own port)
pnpm run dev
# web: 3000, provider-portal: 3001, admin: 3002

# Local Lambda API (SAM; Python functions work without Docker)
pnpm run sam:local
# Then: cd infrastructure/sam && sam local start-api
```

---

## Database (Aurora Serverless v2 + Prisma)

1. Create an Aurora Serverless v2 PostgreSQL cluster in the AWS Console (or add an RDS stack in CDK).
2. Set the connection string:

   ```bash
   export DATABASE_URL="postgresql://user:password@your-cluster.cluster-xxx.us-east-1.rds.amazonaws.com:5432/rosteriq"
   ```

3. Generate Prisma client and run migrations:

   ```bash
   cd packages/db
   pnpm run db:generate
   pnpm run db:push   # or db:migrate for production
   ```

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Apps / Lambdas that use DB | Aurora PostgreSQL connection string |
| `EVENT_BUS_NAME` | Lambdas | EventBridge bus name (set by CDK) |
| `ATHENA_WORKGROUP` | Analytics Lambda | Athena workgroup |
| `ATHENA_OUTPUT_LOCATION` | Analytics Lambda | S3 path for query results |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | CLI / GitHub Actions | AWS credentials |

---

## Scripts reference

| Script | Description |
|--------|-------------|
| `pnpm run build` | Build all workspace packages and apps |
| `pnpm run dev` | Run all Next.js apps in dev mode |
| `pnpm run deploy` | Deploy infrastructure then apps (see above) |
| `pnpm run deploy:infra` | Deploy CDK stacks only |
| `pnpm run deploy:apps` | Deploy Next.js apps (needs `DEPLOY_TARGET`) |
| `pnpm run sam:local` | Start local Lambda API (SAM) |
| `pnpm run clean` | Remove build artifacts and node_modules |

---

## License

Proprietary — RosterIQ™.
