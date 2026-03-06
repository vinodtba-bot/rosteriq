import type { Handler } from 'aws-lambda';
import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
} from '@aws-sdk/client-athena';

const athena = new AthenaClient({});
const WORKGROUP = process.env.ATHENA_WORKGROUP ?? 'primary';
const OUTPUT_LOCATION = process.env.ATHENA_OUTPUT_LOCATION ?? '';

export interface AnalyticsEvent {
  queryId?: string;
  sql?: string;
}

export const runQuery: Handler<AnalyticsEvent, { queryId: string; status: string }> = async (
  event
) => {
  const sql = event.sql ?? 'SELECT 1';
  const result = await athena.send(
    new StartQueryExecutionCommand({
      QueryString: sql,
      WorkGroup: WORKGROUP,
      ResultConfiguration: OUTPUT_LOCATION
        ? { OutputLocation: OUTPUT_LOCATION }
        : undefined,
    })
  );
  const queryId = result.QueryExecutionId ?? '';
  const status = await pollQuery(queryId);
  return { queryId, status };
};

async function pollQuery(queryId: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const exec = await athena.send(
      new GetQueryExecutionCommand({ QueryExecutionId: queryId })
    );
    const state = exec.QueryExecution?.Status?.State;
    if (state === 'SUCCEEDED' || state === 'FAILED' || state === 'CANCELLED') {
      return state;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return 'RUNNING';
}

export const getQueryResults: Handler<{ queryId: string }, unknown> = async (event) => {
  const results = await athena.send(
    new GetQueryResultsCommand({ QueryExecutionId: event.queryId })
  );
  return results.ResultSet;
};
