/**
 * TimePeriod Tests
 *
 * Testes para o Value Object TimePeriod
 */

import { describe, it, expect } from 'bun:test';
import { TimePeriod, getDateRange } from '../../../../src/domain/report/value-objects/time-period.enum';

describe('TimePeriod', () => {
  describe('getDateRange', () => {
    it('should return WEEK period with start date 7 days ago', () => {
      const now = new Date();
      const range = getDateRange(TimePeriod.WEEK);

      const diffDays = Math.floor((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(8);
    });

    it('should return MONTH range with start on day 1', () => {
      const range = getDateRange(TimePeriod.MONTH);

      expect(range.start.getDate()).toBe(1);
      expect(range.start.getHours()).toBe(0);
      expect(range.start.getMinutes()).toBe(0);
      expect(range.start.getSeconds()).toBe(0);
    });

    it('should return QUARTER range with start 3 months ago', () => {
      const now = new Date();
      const range = getDateRange(TimePeriod.QUARTER);

      const monthDiff = (now.getFullYear() - range.start.getFullYear()) * 12 + (now.getMonth() - range.start.getMonth());
      expect(monthDiff).toBeGreaterThanOrEqual(2);
      expect(monthDiff).toBeLessThanOrEqual(4);
    });

    it('should return YEAR range with start on January 1', () => {
      const range = getDateRange(TimePeriod.YEAR);

      expect(range.start.getMonth()).toBe(0); // January
      expect(range.start.getDate()).toBe(1);
    });

    it('should return custom range for CUSTOM period', () => {
      const customStart = new Date('2026-01-01');
      const customEnd = new Date('2026-12-31');

      const range = getDateRange(TimePeriod.CUSTOM, customStart, customEnd);

      expect(range.start).toBe(customStart);
      expect(range.end).toBe(customEnd);
    });

    it('should return default month start for CUSTOM without dates', () => {
      const now = new Date();
      const range = getDateRange(TimePeriod.CUSTOM);

      expect(range.start.getFullYear()).toBe(now.getFullYear());
      expect(range.start.getMonth()).toBe(now.getMonth());
      expect(range.start.getDate()).toBe(1);
    });
  });
});
