# Quickstart: Overdue Todo Items Feature

**Date**: February 27, 2026  
**Feature**: Support for Overdue Todo Items  
**Branch**: `001-overdue-todos`

## Overview

This guide helps developers quickly understand and work with the overdue todos feature. The feature adds visual indicators and duration information for incomplete todos past their due date.

**Complexity**: LOW (date comparison logic + computed properties + visual components)

**Estimated Development Time**: 4-6 hours (including TDD)

---

## Prerequisites

**Required**:
- Node.js 18+ installed
- npm 8+ installed
- Git configured
- Existing todo app running (see root README.md)

**Recommended**:
- VS Code with ESLint extension
- Screen reader for accessibility testing (NVDA, JAWS, or VoiceOver)

---

## Quick Setup

### 1. Get the Code

```bash
# Clone and switch to feature branch
git clone <repository-url>
cd copilot-bootcamp-session-6
git checkout 001-overdue-todos

# Install dependencies
npm install
```

### 2. Verify Environment

```bash
# Run existing tests to ensure baseline passes
npm test

# Expected: All tests pass (baseline ~80% coverage)
```

### 3. Start Development Servers

```bash
# Terminal 1: Start both frontend and backend
npm start

# Access the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:3030
```

---

## Feature Architecture

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│                          Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ TodoCard Component                                      │ │
│  │  ├── Title, Description                                 │ │
│  │  ├── Due Date Display                                   │ │
│  │  └── OverdueIndicator (NEW)                            │ │
│  │       ├── Icon (⚠️)                                     │ │
│  │       ├── Text ("2 days overdue")                      │ │
│  │       └── ARIA labels                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕ HTTP                              │
└──────────────────────────────────────────────────────────────┘
                             ↕
┌──────────────────────────────────────────────────────────────┐
│                      Backend API                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ GET /api/todos                                          │ │
│  │  └── todoService.getAllTodos()                         │ │
│  │       ├── Fetch from database                          │ │
│  │       └── Compute overdue fields (NEW)                 │ │
│  │            ├── isOverdue (boolean)                     │ │
│  │            ├── overdueDays (number)                    │ │
│  │            └── overdueDuration (string)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ SQLite Database (todos table)                          │ │
│  │  - No schema changes needed                            │ │
│  │  - Uses existing dueDate and status fields            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Backend (TDD Approach)

**Time**: ~2 hours

- [ ] **Step 1.1**: Write tests for `isOverdue()` logic
  - `packages/backend/__tests__/services/todoService.test.js`
  - Test cases: past/today/future dates, completed status, no due date
  - Use `jest.useFakeTimers()` for deterministic date testing

- [ ] **Step 1.2**: Implement `isOverdue()` function
  - `packages/backend/src/services/todoService.js`
  - Date comparison logic (normalize to midnight)
  - Handle edge cases (null date, completed status)

- [ ] **Step 1.3**: Write tests for `getOverdueDays()` logic
  - Test cases: 1 day, 7 days, 30+ days, not overdue

- [ ] **Step 1.4**: Implement `getOverdueDays()` function
  - Calculate day difference
  - Return null if not overdue

- [ ] **Step 1.5**: Write tests for `formatOverdueDuration()` logic
  - Test cases: "1 day", "7 days", "1 month", "5 months", "1+ year"

- [ ] **Step 1.6**: Implement `formatOverdueDuration()` function
  - Tiered formatting logic

- [ ] **Step 1.7**: Write integration tests for API endpoints
  - Test GET /api/todos returns computed fields
  - Test POST /api/todos includes computed fields
  - Test PUT /api/todos recalculates computed fields

- [ ] **Step 1.8**: Enhance API response serialization
  - Add computed fields to todo objects before sending response
  - Update `getAllTodos()`, `getTodoById()`, `createTodo()`, `updateTodo()`

**Verification**:
```bash
npm run test:backend
# Expected: All backend tests pass, coverage >= 80%
```

---

### Phase 2: Frontend (TDD Approach)

**Time**: ~2 hours

- [ ] **Step 2.1**: Write tests for OverdueIndicator component
  - `packages/frontend/src/components/__tests__/OverdueIndicator.test.js`
  - Test cases: overdue display, non-overdue (nothing shown), accessibility attributes

- [ ] **Step 2.2**: Implement OverdueIndicator component
  - `packages/frontend/src/components/OverdueIndicator.js`
  - Props: `isOverdue`, `overdueDays`, `overdueDuration`
  - Render: icon + text + ARIA labels
  - Styling: distinct visual indicator (not color-only)

- [ ] **Step 2.3**: Write tests for OverdueIndicator CSS/styling
  - Ensure non-color indicators (icon, text visible)
  - Test theme support (light/dark mode)

- [ ] **Step 2.4**: Add OverdueIndicator styles
  - `packages/frontend/src/components/OverdueIndicator.css` (or inline styles)
  - Styling: red accent color + warning icon + bold text
  - Ensure WCAG AA contrast ratios

- [ ] **Step 2.5**: Update TodoCard component tests
  - Test that OverdueIndicator appears when todo is overdue
  - Test that indicator does NOT appear for non-overdue todos

- [ ] **Step 2.6**: Integrate OverdueIndicator into TodoCard
  - `packages/frontend/src/components/TodoCard.js`
  - Conditionally render `<OverdueIndicator />` based on `isOverdue` prop
  - Pass through `overdueDays` and `overdueDuration`

- [ ] **Step 2.7**: Update frontend service to handle new fields
  - `packages/frontend/src/services/todoService.js`
  - Verify API response includes computed fields
  - No changes needed if API already returns fields

**Verification**:
```bash
npm run test:frontend
# Expected: All frontend tests pass, coverage >= 80%
```

---

### Phase 3: Integration & Accessibility Testing

**Time**: ~1 hour

- [ ] **Step 3.1**: Manual testing with test data
  - Create todo with past due date → verify overdue indicator shows
  - Create todo with today's due date → verify NO overdue indicator
  - Mark overdue todo as completed → verify indicator disappears
  - Create todo without due date → verify NO overdue indicator

- [ ] **Step 3.2**: Screen reader testing
  - Use NVDA/JAWS (Windows) or VoiceOver (Mac)
  - Verify overdue status is announced
  - Verify duration is announced
  - Verify icon is properly hidden from screen readers (`aria-hidden="true"`)

- [ ] **Step 3.3**: Keyboard navigation testing
  - Tab through todos
  - Verify focus indicators remain visible
  - Verify no keyboard traps

- [ ] **Step 3.4**: Color contrast testing
  - Use browser DevTools or Lighthouse
  - Verify overdue text meets WCAG AA contrast ratio (4.5:1)
  - Test in both light and dark modes

- [ ] **Step 3.5**: Performance testing
  - Create 1000 test todos (script or manual)
  - Measure page load time
  - Verify < 1 second total (target: < 100ms)

**Verification**:
```bash
# Run all tests
npm test

# Expected: All tests pass, coverage >= 80%
```

---

## Key Code Snippets

### Backend: Overdue Calculation

```javascript
// packages/backend/src/services/todoService.js

/**
 * Determines if a todo is overdue
 */
function isOverdue(todo) {
  if (!todo.dueDate || todo.status === 'completed') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(todo.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

/**
 * Gets number of days overdue
 */
function getOverdueDays(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffMs = today - due;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats overdue duration
 */
function formatOverdueDuration(days) {
  if (days >= 365) return '1+ year';
  if (days >= 31) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  return `${days} day${days > 1 ? 's' : ''}`;
}

/**
 * Enhance todo with computed overdue fields
 */
function enhanceTodoWithOverdueFields(todo) {
  const overdueStatus = isOverdue(todo);
  const overdueDays = overdueStatus ? getOverdueDays(todo.dueDate) : null;
  const overdueDuration = overdueDays ? formatOverdueDuration(overdueDays) : null;
  
  return {
    ...todo,
    isOverdue: overdueStatus,
    overdueDays,
    overdueDuration
  };
}

module.exports = {
  isOverdue,
  getOverdueDays,
  formatOverdueDuration,
  enhanceTodoWithOverdueFields,
  // ... other exports
};
```

---

### Frontend: OverdueIndicator Component

```jsx
// packages/frontend/src/components/OverdueIndicator.js

import React from 'react';
import './OverdueIndicator.css';

/**
 * Displays overdue status for a todo item
 * @param {boolean} isOverdue - Whether the todo is overdue
 * @param {number} overdueDays - Days overdue (null if not overdue)
 * @param {string} overdueDuration - Human-readable duration (null if not overdue)
 */
function OverdueIndicator({ isOverdue, overdueDays, overdueDuration }) {
  if (!isOverdue) return null;
  
  return (
    <div className="overdue-indicator" role="status" aria-live="polite">
      {/* Icon provides visual cue (hidden from screen readers) */}
      <span className="overdue-icon" aria-hidden="true">⚠️</span>
      
      {/* Text content visible and screen-reader accessible */}
      <span className="overdue-text">
        Overdue by {overdueDuration}
      </span>
      
      {/* Additional context for screen readers */}
      <span className="sr-only">
        This task is {overdueDays} {overdueDays === 1 ? 'day' : 'days'} overdue
      </span>
    </div>
  );
}

export default OverdueIndicator;
```

---

### Frontend: Integrate into TodoCard

```jsx
// packages/frontend/src/components/TodoCard.js

import React from 'react';
import OverdueIndicator from './OverdueIndicator';
import './TodoCard.css';

function TodoCard({ todo, onToggle, onDelete }) {
  return (
    <div className="todo-card">
      <h3>{todo.title}</h3>
      {todo.description && <p>{todo.description}</p>}
      
      {todo.dueDate && (
        <div className="due-date">
          Due: {new Date(todo.dueDate).toLocaleDateString()}
        </div>
      )}
      
      {/* NEW: Overdue indicator */}
      <OverdueIndicator 
        isOverdue={todo.isOverdue}
        overdueDays={todo.overdueDays}
        overdueDuration={todo.overdueDuration}
      />
      
      <button onClick={() => onToggle(todo.id)}>
        {todo.status === 'completed' ? 'Reopen' : 'Complete'}
      </button>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
}

export default TodoCard;
```

---

## Testing Strategy

### Unit Tests (Backend)

```javascript
// packages/backend/__tests__/services/todoService.test.js

describe('Overdue calculation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-27T12:00:00Z'));
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  describe('isOverdue', () => {
    it('returns true for past due date with pending status', () => {
      const todo = { dueDate: '2026-02-25', status: 'pending' };
      expect(isOverdue(todo)).toBe(true);
    });
    
    it('returns false for today\'s due date', () => {
      const todo = { dueDate: '2026-02-27', status: 'pending' };
      expect(isOverdue(todo)).toBe(false);
    });
    
    it('returns false for completed todo with past due date', () => {
      const todo = { dueDate: '2026-02-25', status: 'completed' };
      expect(isOverdue(todo)).toBe(false);
    });
    
    it('returns false for null due date', () => {
      const todo = { dueDate: null, status: 'pending' };
      expect(isOverdue(todo)).toBe(false);
    });
  });
  
  describe('getOverdueDays', () => {
    it('returns correct number of days for past date', () => {
      expect(getOverdueDays('2026-02-25')).toBe(2); // 2 days ago
    });
    
    it('returns 0 for today', () => {
      expect(getOverdueDays('2026-02-27')).toBe(0);
    });
  });
  
  describe('formatOverdueDuration', () => {
    it('formats single day correctly', () => {
      expect(formatOverdueDuration(1)).toBe('1 day');
    });
    
    it('formats multiple days correctly', () => {
      expect(formatOverdueDuration(7)).toBe('7 days');
    });
    
    it('formats months correctly', () => {
      expect(formatOverdueDuration(31)).toBe('1 month');
      expect(formatOverdueDuration(60)).toBe('2 months');
    });
    
    it('formats years correctly', () => {
      expect(formatOverdueDuration(365)).toBe('1+ year');
      expect(formatOverdueDuration(500)).toBe('1+ year');
    });
  });
});
```

---

### Component Tests (Frontend)

```javascript
// packages/frontend/src/components/__tests__/OverdueIndicator.test.js

import { render, screen } from '@testing-library/react';
import OverdueIndicator from '../OverdueIndicator';

describe('OverdueIndicator', () => {
  it('renders overdue indicator when todo is overdue', () => {
    render(
      <OverdueIndicator 
        isOverdue={true} 
        overdueDays={5} 
        overdueDuration="5 days" 
      />
    );
    
    expect(screen.getByText(/Overdue by 5 days/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('does not render when todo is not overdue', () => {
    const { container } = render(
      <OverdueIndicator 
        isOverdue={false} 
        overdueDays={null} 
        overdueDuration={null} 
      />
    );
    
    expect(container).toBeEmptyDOMElement();
  });
  
  it('has proper accessibility attributes', () => {
    render(
      <OverdueIndicator 
        isOverdue={true} 
        overdueDays={3} 
        overdueDuration="3 days" 
      />
    );
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
  
  it('includes screen-reader-only text', () => {
    render(
      <OverdueIndicator 
        isOverdue={true} 
        overdueDays={3} 
        overdueDuration="3 days" 
      />
    );
    
    expect(screen.getByText(/This task is 3 days overdue/i)).toHaveClass('sr-only');
  });
});
```

---

## Common Issues & Solutions

### Issue 1: Tests Failing Due to Date Differences

**Symptom**: Tests pass locally but fail in CI, or vice versa

**Cause**: Date comparison sensitive to system timezone

**Solution**: 
- Always use `jest.useFakeTimers()` and `jest.setSystemTime()` in tests
- Normalize dates to midnight using `.setHours(0, 0, 0, 0)`

**Example**:
```javascript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-27T12:00:00Z')); // Fixed UTC time
});

afterEach(() => {
  jest.useRealTimers();
});
```

---

### Issue 2: Overdue Status Not Updating After Todo Update

**Symptom**: User marks todo as completed, but overdue indicator remains

**Cause**: Frontend not re-fetching todo data after update

**Solution**:
- Ensure `PUT /api/todos/:id` returns updated todo with recomputed fields
- Frontend updates local state with response data

**Example**:
```javascript
// Frontend: todoService.js
async function updateTodo(id, updates) {
  const response = await axios.put(`/api/todos/${id}`, updates);
  return response.data; // Include fresh computed fields
}
```

---

### Issue 3: Screen Reader Not Announcing Overdue Status

**Symptom**: Screen reader users can't hear overdue information

**Cause**: Missing or incorrect ARIA attributes

**Solution**:
- Use `role="status"` for status indicators
- Use `aria-live="polite"` for non-urgent updates
- Include text content (not just icons)

**Example**:
```jsx
<div className="overdue-indicator" role="status" aria-live="polite">
  <span aria-hidden="true">⚠️</span>
  <span>Overdue by 5 days</span>
</div>
```

---

### Issue 4: Performance Degradation with Large Lists

**Symptom**: App becomes slow with 1000+ todos

**Cause**: Rendering all todos at once

**Solution** (if needed):
- Implement virtual scrolling (react-window)
- Add pagination
- Implement server-side filtering

**Current Status**: Not needed for 1000 todos (meets <1s requirement)

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] Code coverage >= 80%
- [ ] ESLint shows no errors or warnings
- [ ] Manual accessibility testing completed
- [ ] Performance testing completed (1000 todos < 1s)
- [ ] Code reviewed and approved

### Deployment Steps

```bash
# 1. Merge feature branch
git checkout main
git merge 001-overdue-todos

# 2. Run final tests
npm test

# 3. Build for production (if applicable)
npm run build

# 4. Deploy (follow project deployment process)
# [Project-specific deployment commands]

# 5. Verify in production
# - Create test todo with past due date
# - Verify overdue indicator appears
# - Test screen reader accessibility
```

---

## Documentation Updates

After feature completion, update the following:

- [ ] Root `README.md` - Add overdue feature to feature list  
- [ ] `docs/functional-requirements.md` - Document overdue requirements
- [ ] `docs/ui-guidelines.md` - Add overdue indicator design guidelines
- [ ] `docs/testing-guidelines.md` - Add date testing best practices
- [ ] API documentation - Update response schemas with computed fields

---

## Support & Resources

**Documentation**:
- [Feature Specification](spec.md)
- [Research Document](research.md)
- [Data Model](data-model.md)
- [API Contract](contracts/api-contract.md)

**Testing Resources**:
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [React Testing Library](https://testing-library.com/react)
- [ARIA: status role](https://www.w3.org/TR/wai-aria-1.2/#status)

**Accessibility Tools**:
- [NVDA Screen Reader](https://www.nvaccess.org/) (Windows, free)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/) (Windows, commercial)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (Mac/iOS, built-in)
- [axe DevTools](https://www.deque.com/axe/devtools/) (Browser extension)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

---

## Next Steps

After completing this feature:

1. **P2 Priority (Optional)**: Enhance overdue duration display with more detail
2. **P3 Priority (Optional)**: Add filtering/sorting by overdue status
3. **Out of Scope**: Overdue notifications, recurring todos

---

## Questions?

Refer to the [Feature Specification](spec.md) for clarifications resolved during planning.

For technical questions:
- Review [Research Document](research.md) for technical decisions
- Check [Data Model](data-model.md) for entity structure
- Consult [API Contract](contracts/api-contract.md) for endpoint details
