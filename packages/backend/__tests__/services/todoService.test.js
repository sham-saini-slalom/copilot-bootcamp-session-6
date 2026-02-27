/**
 * Todo Service Tests - Date Utility Functions
 * Tests for overdue calculation logic
 */

const { isOverdue, getOverdueDays, formatOverdueDuration } = require('../../src/services/todoService');

describe('Overdue Date Utility Functions', () => {
  beforeEach(() => {
    // Mock Date to return fixed 'today' value for deterministic testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-27T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isOverdue()', () => {
    it('should return true when todo is past due date and pending', () => {
      const todo = { dueDate: '2026-02-26', completed: 0 };
      expect(isOverdue(todo)).toBe(true);
    });

    it('should return false when due date is today', () => {
      const todo = { dueDate: '2026-02-27', completed: 0 };
      expect(isOverdue(todo)).toBe(false);
    });

    it('should return false when due date is in the future', () => {
      const todo = { dueDate: '2026-02-28', completed: 0 };
      expect(isOverdue(todo)).toBe(false);
    });

    it('should return false when todo is completed (even with past due date)', () => {
      const todo = { dueDate: '2026-02-20', completed: 1 };
      expect(isOverdue(todo)).toBe(false);
    });

    it('should return false when todo has no due date', () => {
      const todo = { dueDate: null, completed: 0 };
      expect(isOverdue(todo)).toBe(false);
    });

    it('should handle todos 1 day overdue', () => {
      const todo = { dueDate: '2026-02-26', completed: 0 };
      expect(isOverdue(todo)).toBe(true);
    });

    it('should handle todos many days overdue', () => {
      const todo = { dueDate: '2026-01-01', completed: 0 };
      expect(isOverdue(todo)).toBe(true);
    });

    it('should return false for invalid date format (graceful error handling)', () => {
      const todo = { dueDate: 'invalid-date', completed: 0 };
      expect(isOverdue(todo)).toBe(false);
    });
  });

  describe('getOverdueDays()', () => {
    it('should return 1 for todo due yesterday', () => {
      expect(getOverdueDays('2026-02-26')).toBe(1);
    });

    it('should return 7 for todo due 7 days ago', () => {
      expect(getOverdueDays('2026-02-20')).toBe(7);
    });

    it('should return 30 for todo due 30 days ago', () => {
      expect(getOverdueDays('2026-01-28')).toBe(30);
    });

    it('should return 57 for todo due 57 days ago', () => {
      expect(getOverdueDays('2026-01-01')).toBe(57);
    });

    it('should return null when due date is today', () => {
      expect(getOverdueDays('2026-02-27')).toBeNull();
    });

    it('should return null when due date is in the future', () => {
      expect(getOverdueDays('2026-03-01')).toBeNull();
    });

    it('should return null for invalid date format', () => {
      expect(getOverdueDays('invalid-date')).toBeNull();
    });

    it('should return null for null date', () => {
      expect(getOverdueDays(null)).toBeNull();
    });
  });

  describe('formatOverdueDuration()', () => {
    it('should format 1 day correctly (singular)', () => {
      expect(formatOverdueDuration(1)).toBe('1 day');
    });

    it('should format 2 days correctly (plural)', () => {
      expect(formatOverdueDuration(2)).toBe('2 days');
    });

    it('should format 7 days correctly', () => {
      expect(formatOverdueDuration(7)).toBe('7 days');
    });

    it('should format 30 days correctly', () => {
      expect(formatOverdueDuration(30)).toBe('30 days');
    });

    it('should format 31 days as 1 month (singular)', () => {
      expect(formatOverdueDuration(31)).toBe('1 month');
    });

    it('should format 60 days as 2 months', () => {
      expect(formatOverdueDuration(60)).toBe('2 months');
    });

    it('should format 90 days as 3 months', () => {
      expect(formatOverdueDuration(90)).toBe('3 months');
    });

    it('should format 364 days as 12 months', () => {
      expect(formatOverdueDuration(364)).toBe('12 months');
    });

    it('should format 365 days as "1+ year"', () => {
      expect(formatOverdueDuration(365)).toBe('1+ year');
    });

    it('should format 500 days as "1+ year"', () => {
      expect(formatOverdueDuration(500)).toBe('1+ year');
    });

    it('should format 0 days as "0 days"', () => {
      expect(formatOverdueDuration(0)).toBe('0 days');
    });
  });
});
