# Research: Overdue Todo Items Feature

**Date**: February 27, 2026  
**Feature**: Support for Overdue Todo Items  
**Branch**: `001-overdue-todos`

## Research Questions & Findings

### 1. Date Comparison & Overdue Calculation in JavaScript

**Decision**: Use native JavaScript `Date` objects with timezone-aware comparison

**Rationale**:
- No external date library needed (moment.js adds 66KB, date-fns adds complexity)
- Native `Date` objects handle timezone automatically via browser/system settings
- Simple comparison: `new Date(dueDate) < new Date().setHours(0,0,0,0)` for day-level precision
- Performance: Native operations are fast enough for 1000 todos (<1ms per comparison)

**Alternatives Considered**:
- **date-fns**: More utility functions but adds dependency and 17KB bundle size (rejected: KISS principle, native sufficient)
- **Temporal API**: Modern but browser support incomplete as of 2026 (rejected: compatibility concerns)
- **Moment.js**: Deprecated and large bundle size (rejected: deprecated, violates simplicity)

**Implementation Pattern**:
```javascript
// Backend: todoService.js
function isOverdue(todo) {
  if (!todo.dueDate || todo.status === 'completed') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const dueDate = new Date(todo.dueDate);
  dueDate.setHours(0, 0, 0, 0); // Start of due date
  
  return dueDate < today;
}

function getOverdueDays(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffMs = today - due;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
```

---

### 2. Computed Property Pattern vs Stored Overdue Status

**Decision**: Compute overdue status dynamically (not stored in database)

**Rationale**:
- **Correctness**: Always accurate without background jobs or stale data
- **Simplicity**: No cron jobs, no database updates, no sync issues (KISS principle)
- **Performance**: For 1000 todos, computation takes <1ms total (well under 1s requirement)
- **Maintainability**: Single source of truth (due date + completion status)

**Alternatives Considered**:
- **Store overdue status in DB**: Requires background job to keep updated (rejected: adds complexity, violates KISS)
- **Cache computed values**: Adds cache invalidation complexity (rejected: premature optimization)

**Implementation Approach**:
- Backend: Add `isOverdue` and `overdueDays` as computed fields when returning todos
- Frontend: Display computed values directly, no client-side calculation needed
- API contract: Include `isOverdue` (boolean) and `overdueDays` (number, null if not overdue) in todo responses

---

### 3. Accessibility Best Practices for Time-Sensitive Information

**Decision**: Combine visual indicators with semantic HTML and ARIA labels

**Rationale**:
- **WCAG AA compliance**: Must not rely on color alone (Guideline 1.4.1)
- **Screen reader support**: Announce overdue status and duration clearly
- **Keyboard navigation**: No impact (existing focus management sufficient)

**Implementation Pattern**:
```jsx
// Frontend: OverdueIndicator.js
<div className="overdue-indicator" role="status" aria-live="polite">
  {/* Icon provides visual cue independent of color */}
  <span className="overdue-icon" aria-hidden="true">⚠️</span>
  
  {/* Text provides semantic meaning */}
  <span className="overdue-text">
    Overdue by {formatDuration(overdueDays)}
  </span>
  
  {/* Additional ARIA label for screen readers */}
  <span className="sr-only">
    This task is {overdueDays} days overdue
  </span>
</div>
```

**ARIA Best Practices**:
- Use `role="status"` for status indicators (polite announcement)
- Use `aria-live="polite"` for dynamic updates that don't require immediate attention
- Include text content alongside visual indicators (icon + text, not icon alone)
- Use `.sr-only` class for screen-reader-only context when needed

**Alternatives Considered**:
- **Color only**: Violates WCAG 1.4.1 (rejected: fails accessibility requirement)
- **Icon only**: Inaccessible to screen readers (rejected: fails accessibility requirement)

---

### 4. Testing Date-Dependent Features

**Decision**: Mock `Date` constructor for deterministic testing

**Rationale**:
- **Determinism**: Tests must pass regardless of when they run
- **Edge cases**: Easily test midnight boundaries, timezone edge cases
- **Maintainability**: Clear test setup with explicit date values

**Implementation Pattern**:
```javascript
// Backend: __tests__/todoService.test.js
describe('overdue calculation', () => {
  beforeEach(() => {
    // Mock Date to return fixed 'today' value
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-27T12:00:00Z'));
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('todo is overdue when due date is yesterday', () => {
    const todo = { dueDate: '2026-02-26', status: 'pending' };
    expect(isOverdue(todo)).toBe(true);
  });
  
  test('todo is NOT overdue when due date is today', () => {
    const todo = { dueDate: '2026-02-27', status: 'pending' };
    expect(isOverdue(todo)).toBe(false);
  });
});
```

**Alternatives Considered**:
- **Real dates with offsets**: Brittle, tests break at midnight (rejected: non-deterministic)
- **Dependency injection**: Over-engineering for date utilities (rejected: violates KISS)

---

### 5. Duration Display Formatting

**Decision**: Implement tiered formatting (days → months → years)

**Rationale**:
- **Spec requirement**: "X days" (1-30), "X months" (31-364), "1+ year" (365+)
- **User understanding**: Avoids "347 days overdue" which is harder to interpret than "11 months overdue"
- **Simple calculation**: Use integer division with clear thresholds

**Implementation Pattern**:
```javascript
// Backend: todoService.js or utility
function formatOverdueDuration(days) {
  if (days >= 365) {
    return '1+ year';
  } else if (days >= 31) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}
```

**Alternatives Considered**:
- **Always show days**: User-unfriendly for large numbers (rejected: UX requirement)
- **Relative time library**: Adds dependency for simple calculation (rejected: KISS)

---

### 6. Performance Optimization for 1000 Todos

**Decision**: No optimization needed for initial implementation

**Rationale**:
- **Benchmark**: Date comparison in JavaScript takes ~0.001ms per operation
- **Calculate**: 1000 todos × 0.001ms = 1ms total (well under 1s requirement)
- **KISS principle**: Don't optimize prematurely; measure first, optimize only if needed

**Future Optimization (if needed)**:
- Memoization of "today's date" (compute once per request)
- Server-side filtering before sending to client (reduce network payload)
- Virtual scrolling for large lists (React Virtualized or react-window)

**Alternatives Considered**:
- **Pre-compute and cache**: Premature optimization (rejected: YAGNI)
- **Web workers**: Overkill for simple date math (rejected: excessive complexity)

---

### 7. React Component Architecture for Overdue Display

**Decision**: Create reusable `OverdueIndicator` component

**Rationale**:
- **Single Responsibility**: Component only handles overdue display (not data fetching)
- **Reusability**: Can be used in TodoCard, TodoList, or future views
- **Testability**: Isolated component with clear props interface
- **Maintainability**: Centralized styling and accessibility logic

**Component API**:
```jsx
<OverdueIndicator 
  isOverdue={boolean}
  overdueDays={number}
  format="compact|full"  // "compact" = icon only, "full" = icon + text
/>
```

**Alternatives Considered**:
- **Inline in TodoCard**: Violates single responsibility, harder to test (rejected: DRY violation)
- **Higher-order component**: Over-engineering for simple display logic (rejected: KISS)

---

## Technology Stack Summary

| Category | Technology | Version | Justification |
|----------|-----------|---------|---------------|
| Date Handling | Native JavaScript Date | Built-in | No external dependency needed; sufficient for requirements |
| Testing | Jest (useFakeTimers) | 29.7.0 | Already in use; excellent date mocking support |
| Accessibility | ARIA Labels + Semantic HTML | WCAG 2.1 AA | Required for screen reader support |
| React | React 18 | 18.2.0 | Existing project dependency |
| Backend | Express + SQLite | 4.18.2 + 11.10.0 | Existing project stack |

---

## Implementation Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Timezone edge cases | Medium | Low | Use `.setHours(0,0,0,0)` to normalize dates; test edge cases explicitly |
| Performance degradation with large lists | Medium | Low | Monitor with performance tests; optimize only if needed (memoization, virtual scrolling) |
| Accessibility violations | High | Low | Follow WCAG guidelines; test with screen readers; use automated accessibility testing |
| Stale overdue status after midnight | Low | Medium | Acceptable per spec ("recalculate on explicit user actions"); document behavior |

---

## Open Questions (Resolved in Spec)

All clarifications have been resolved in the feature specification:

- ✅ **Accessibility**: Screen readers must announce status; don't rely on color alone
- ✅ **Performance**: Support 1000 todos with <1s performance
- ✅ **Real-time updates**: Recalculate only on explicit user actions (not automatic)
- ✅ **Duration format**: Days (1-30) → Months (31-364) → Years (365+)
- ✅ **Error handling**: Show todo without indicator, log error silently

---

## References

- [WCAG 2.1 Guideline 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color)
- [MDN: JavaScript Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Jest: Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [React Testing Library: Accessibility Testing](https://testing-library.com/docs/react-testing-library/intro/)
- [ARIA: status role](https://www.w3.org/TR/wai-aria-1.2/#status)
