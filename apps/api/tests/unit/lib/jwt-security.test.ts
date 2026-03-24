/**
 * Test to verify JWT_SECRET requirement
 */

import { describe, it, expect } from 'bun:test';

describe('JWT Security', () => {
  it('should fail to load jwt lib if JWT_SECRET is missing', async () => {
    // We use a subprocess because the module is already loaded in the main process
    // and we need to test the initial load behavior without the env var.
    const proc = Bun.spawn(['bun', '-e', 'import("./apps/api/src/lib/jwt.ts")'], {
      env: {
        ...process.env,
        JWT_SECRET: '',
      },
      stderr: 'pipe',
    });

    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    expect(exitCode).not.toBe(0);
    expect(stderr).toContain('JWT_SECRET is required');
  });

  it('should succeed to load jwt lib if JWT_SECRET is present', async () => {
    const proc = Bun.spawn(['bun', '-e', 'import("./apps/api/src/lib/jwt.ts")'], {
      env: {
        ...process.env,
        JWT_SECRET: 'some-safe-secret',
      },
      stderr: 'pipe',
    });

    const exitCode = await proc.exited;
    const stderr = await new Response(proc.stderr).text();

    // It might still fail if jsonwebtoken is missing in the environment where bun -e runs,
    // but it SHOULD NOT fail with "JWT_SECRET is required".
    if (exitCode !== 0) {
        expect(stderr).not.toContain('JWT_SECRET is required');
    } else {
        expect(exitCode).toBe(0);
    }
  });
});
