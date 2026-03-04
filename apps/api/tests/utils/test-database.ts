/**
 * Test Database Utilities
 * 
 * Funções auxiliares para setup e cleanup de banco de dados de teste
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../src/db/schema';

export type TestDatabase = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Configuração do banco de dados de teste
 */
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/podcast_saas_test';

/**
 * Criar conexão com banco de dados de teste
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const client = postgres(TEST_DATABASE_URL);
  return drizzle(client, { schema });
}

/**
 * Limpar todas as tabelas do banco de dados de teste
 */
export async function cleanupTestDatabase(db: TestDatabase): Promise<void> {
  // Truncar todas as tabelas em ordem reversa de dependência
  const tables = [
    'payments',
    'invoices',
    'budget_items',
    'budgets',
    'agenda',
    'lead_interactions',
    'leads',
    'episodes',
    'scripts',
    'production_tasks',
    'whitelabel_configs',
  ];

  for (const table of tables) {
    try {
      await db.execute(`TRUNCATE TABLE ${table} CASCADE`);
    } catch (error) {
      // Tabela pode não existir, ignorar
    }
  }
}

/**
 * Resetar sequências de auto-incremento
 */
export async function resetSequences(db: TestDatabase): Promise<void> {
  const sequences = [
    'leads_id_seq',
    'agenda_id_seq',
    'episodes_id_seq',
    'scripts_id_seq',
    'production_tasks_id_seq',
    'budgets_id_seq',
    'budget_items_id_seq',
    'invoices_id_seq',
    'payments_id_seq',
    'lead_interactions_id_seq',
    'whitelabel_configs_id_seq',
  ];

  for (const seq of sequences) {
    try {
      await db.execute(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
    } catch (error) {
      // Sequência pode não existir, ignorar
    }
  }
}

/**
 * Setup completo do banco de dados de teste
 */
export async function setupTestDatabase(): Promise<TestDatabase> {
  const db = await createTestDatabase();
  await cleanupTestDatabase(db);
  await resetSequences(db);
  return db;
}

/**
 * Fechar conexão com banco de dados de teste
 */
export async function closeTestDatabase(db: TestDatabase): Promise<void> {
  const client = (db as any).client;
  if (client) {
    await client.end();
  }
}
