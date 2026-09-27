import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your .env file or environment.');
    console.error('Example: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/podcast_saas');
    throw new Error('DATABASE_URL is required but was not provided');
}

/**
 * Builds the Drizzle client for the project schema.
 *
 * Extracted so the exported `Database` type can be derived from the call
 * itself instead of being hand-written. Drizzle infers the schema here, which
 * is what makes `db.query.<table>` resolve in every repository adapter.
 */
function createDatabase(connection: string) {
    const client = postgres(connection);
    return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDatabase>;

let db: Database;

try {
    db = createDatabase(connectionString);
    // postgres() and drizzle() are both lazy: no socket is opened here. The
    // connection is established on the first query, and an unreachable host
    // surfaces there rather than at startup.
    console.log('✅ Database client initialised (connection opens on first query)');
} catch (error) {
    // Reachable only for a malformed DATABASE_URL, which postgres() throws on
    // synchronously. Connection failures do not land here.
    console.error('❌ Failed to initialise the database client');
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Please check that DATABASE_URL is a valid Postgres connection string.');
    throw error;
}

export { db };
