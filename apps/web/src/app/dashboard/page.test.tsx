/**
 * Dashboard Page Tests
 *
 * Test dashboard page rendering and protection
 */

import { describe, it, expect } from 'vitest';
import DashboardPage from './page';

describe('DashboardPage', () => {
  it('should exist and be renderable', () => {
    // Basic test to ensure component exists
    expect(DashboardPage).toBeDefined();
  });

  it('should have withAuth HOC applied', () => {
    // Verify the component has the withAuth wrapper
    expect(DashboardPage.displayName).toContain('withAuth');
  });
});
