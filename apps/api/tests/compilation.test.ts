/**
 * TypeScript Compilation Test
 * 
 * Teste que valida se o projeto compila sem erros
 */

import { describe, it, expect } from 'bun:test';
import { execSync } from 'child_process';

describe('TypeScript Compilation', () => {
  // These shell out to tsc, which type-checks the whole project and takes
  // ~9s here. Bun's default per-test timeout is 5s, so both were timing out
  // regardless of whether the type check passed.
  const TYPECHECK_TIMEOUT_MS = 60_000;

  it('should compile without errors', () => {
    try {
      // Executar typecheck
      execSync('bun x tsc --noEmit', {
        cwd: __dirname + '/..',
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // Se não lançar erro, compilou com sucesso
      expect(true).toBe(true);
    } catch (error: any) {
      // Se lançar erro, mostrar detalhes
      const stderr = error.stderr?.toString() || error.message;
      throw new Error(`TypeScript compilation failed:\n${stderr}`);
    }
  }, TYPECHECK_TIMEOUT_MS);

  it('should have zero implicit any types', () => {
    try {
      // Executar typecheck com strict mode
      execSync('bun x tsc --noEmit --strict', {
        cwd: __dirname + '/..',
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      expect(true).toBe(true);
    } catch (error: any) {
      const stderr = error.stderr?.toString() || error.message;
      
      // Verificar se é erro de implicit any
      if (stderr.includes('implicit any')) {
        throw new Error(`Found implicit any types:\n${stderr}`);
      }
      
      // Outros erros de typecheck
      throw new Error(`TypeScript strict check failed:\n${stderr}`);
    }
  }, TYPECHECK_TIMEOUT_MS);
});
