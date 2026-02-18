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

let client;
let db;

try {
    client = postgres(connectionString);
    db = drizzle(client, { schema });
    console.log('✅ Database connection established successfully');
} catch (error) {
    console.error('❌ Failed to connect to database');
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Please check your DATABASE_URL and ensure PostgreSQL is running.');
    throw error;
}

export { db };
