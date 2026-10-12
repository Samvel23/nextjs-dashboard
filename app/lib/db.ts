import 'server-only';
import postgres, { type Sql } from 'postgres';

let client: Sql | undefined;

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConfigurationError';
  }
}

export function getDb(): Sql {
  if (client) return client;

  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new DatabaseConfigurationError(
      'Set POSTGRES_URL or DATABASE_URL in your environment.',
    );
  }

  let connectionUrl: URL;
  try {
    connectionUrl = new URL(connectionString);
  } catch {
    throw new DatabaseConfigurationError(
      'POSTGRES_URL or DATABASE_URL must be a valid PostgreSQL connection URL.',
    );
  }

  if (!['postgres:', 'postgresql:'].includes(connectionUrl.protocol)) {
    throw new DatabaseConfigurationError(
      'POSTGRES_URL or DATABASE_URL must use the postgres:// or postgresql:// protocol.',
    );
  }

  client = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return client;
}

export function databaseErrorResponse(error: unknown): Response {
  if (error instanceof DatabaseConfigurationError) {
    console.error('Database configuration error:', error.message);
    return Response.json(
      {
        error: {
          code: 'DATABASE_CONFIGURATION_ERROR',
          message: error.message,
        },
      },
      { status: 500 },
    );
  }

  const code =
    error instanceof Error && 'code' in error && typeof error.code === 'string'
      ? error.code
      : undefined;

  console.error('Database request failed:', error);

  if (
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND'
  ) {
    return Response.json(
      {
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message:
            'The database could not be reached. Check the connection URL, network access, and database availability.',
        },
      },
      { status: 503 },
    );
  }

  return Response.json(
    {
      error: {
        code: 'DATABASE_REQUEST_FAILED',
        message: 'The database request failed. Check the server logs.',
      },
    },
    { status: 500 },
  );
}
