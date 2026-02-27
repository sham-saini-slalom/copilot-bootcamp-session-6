# Data Model: Overdue Todo Items

**Date**: February 27, 2026  
**Feature**: Support for Overdue Todo Items  
**Branch**: `001-overdue-todos`

## Overview

This feature extends the existing Todo entity with computed overdue properties. No new database tables are required; overdue status is calculated dynamically based on existing fields (due date and completion status).

---

## Entities

### Todo (Extended)

**Description**: Represents a task item with extended overdue calculation support

**Storage**: SQLite database (existing table: `todos`)

**Primary Key**: `id` (integer, auto-increment)

#### Stored Fields (Existing + Changes)

| Field Name | Type | Nullable | Default | Description | Changes |
|------------|------|----------|---------|-------------|---------|
| `id` | INTEGER | NOT NULL | AUTO | Unique identifier | No change |
| `title` | TEXT | NOT NULL | - | Task title/description | No change |
| `description` | TEXT | YES | NULL | Detailed task description | No change |
| `dueDate` | TEXT (ISO 8601) | YES | NULL | Due date in format YYYY-MM-DD | **Used for overdue calculation** |
| `status` | TEXT | NOT NULL | 'pending' | Completion status: 'pending' or 'completed' | **Used for overdue calculation** |
| `createdAt` | TEXT (ISO 8601) | NOT NULL | CURRENT_TIMESTAMP | Creation timestamp | No change |
| `updatedAt` | TEXT (ISO 8601) | NOT NULL | CURRENT_TIMESTAMP | Last update timestamp | No change |

#### Computed Fields (NEW - Not Stored)

| Field Name | Type | Nullable | Description | Calculation Logic |
|------------|------|----------|-------------|-------------------|
| `isOverdue` | BOOLEAN | NOT NULL | Whether todo is currently overdue | `dueDate < today AND status != 'completed' AND dueDate IS NOT NULL` |
| `overdueDays` | INTEGER | YES | Number of days overdue (null if not overdue) | `Math.floor((today - dueDate) / (24*60*60*1000))` when `isOverdue == true` |
| `overdueDuration` | STRING | YES | Human-readable overdue duration (null if not overdue) | Formatted based on `overdueDays`: "X days", "X months", "1+ year" |

---

## Relationships

**Todo Entity Relationships**: None (single-user application, no user entity, no categories/tags per scope discipline)

---

## Validation Rules

### Field-Level Validations

#### dueDate
- **Type**: ISO 8601 date string (YYYY-MM-DD)
- **Format**: Must be parseable by JavaScript `new Date()`
- **Range**: No past/future restrictions (user can set any date)
- **Required**: FALSE (nullable field; todos without due dates are valid)
- **Error Handling**: 
  - Invalid format: Reject with 400 Bad Request ("Invalid date format")
  - Unparseable date: Reject with 400 Bad Request ("Cannot parse due date")

#### status
- **Type**: String enum
- **Valid Values**: `'pending'`, `'completed'`
- **Required**: TRUE (defaults to 'pending')
- **Error Handling**: Invalid value rejected with 400 Bad Request

---

## State Transitions

### Overdue Status State Machine

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌───────────────┐                                 │
│  │  No Due Date  │ (dueDate = NULL)                │
│  │ isOverdue=false│                                 │
│  └───────────────┘                                 │
│                                                     │
│  ────────────────────────────────────────────────  │
│                                                     │
│  ┌───────────────┐   Due Date Passes               │
│  │  On Time      │ ──────────────────────────────► │
│  │ isOverdue=false│                                 │
│  └───────────────┘                                 │
│        │                                            │
│        │ Mark Completed                             │
│        ▼                                            │
│  ┌───────────────┐                                 │
│  │  Completed    │                                 │
│  │ isOverdue=false│ (status = 'completed')          │
│  └───────────────┘                                 │
│                                                     │
│  ────────────────────────────────────────────────  │
│                                                     │
│  ┌───────────────┐   Mark Completed                │
│  │   Overdue     │ ──────────────────────────────► │
│  │ isOverdue=true │                                 │
│  │ overdueDays=N  │                                 │
│  └───────────────┘                                 │
│        ▲                                            │
│        │ Due Date Passes (status = 'pending')       │
│        │                                            │
└─────────────────────────────────────────────────────┘
```

**Transition Rules**:
1. **No Due Date → Overdue**: IMPOSSIBLE (todos without due dates cannot become overdue)
2. **On Time → Overdue**: AUTOMATIC when `currentDate > dueDate` and `status = 'pending'`
3. **Overdue → Completed**: USER ACTION (mark todo as completed)
4. **On Time → Completed**: USER ACTION (mark todo as completed before due date)
5. **Completed → Overdue**: IMPOSSIBLE (completed todos never become overdue, even if completion date is after due date)
6. **Overdue → On Time**: USER ACTION (update due date to future date)

---

## Computed Property Logic

### isOverdue Calculation

```javascript
/**
 * Determines if a todo is currently overdue
 * @param {Object} todo - Todo object
 * @param {string|null} todo.dueDate - ISO 8601 date string
 * @param {string} todo.status - 'pending' or 'completed'
 * @returns {boolean} - True if overdue, false otherwise
 */
function isOverdue(todo) {
  // Must have a due date to be overdue
  if (!todo.dueDate) return false;
  
  // Completed todos are never overdue
  if (todo.status === 'completed') return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Start of due date
    
    // Overdue if due date is before today
    return dueDate < today;
  } catch (error) {
    // If date parsing fails, treat as not overdue (error logged separately)
    console.error('Date calculation error:', error);
    return false;
  }
}
```

### overdueDays Calculation

```javascript
/**
 * Calculates number of days overdue
 * @param {string} dueDate - ISO 8601 date string
 * @returns {number|null} - Days overdue, or null if not overdue
 */
function getOverdueDays(dueDate) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffMs = today - due;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Return null if not actually overdue (negative or zero)
    return diffDays > 0 ? diffDays : null;
  } catch (error) {
    console.error('Date calculation error:', error);
    return null;
  }
}
```

### overdueDuration Formatting

```javascript
/**
 * Formats overdue days into human-readable text
 * @param {number} days - Number of days overdue
 * @returns {string} - Formatted duration text
 */
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

---

## Database Schema (No Changes Required)

The existing `todos` table schema already supports this feature:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  dueDate TEXT,  -- ISO 8601: YYYY-MM-DD (already exists)
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' or 'completed' (already exists)
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**No migration required**: All necessary fields already exist.

---

## API Response Shape

### GET /api/todos (Enhanced)

**Before (Existing)**:
```json
[
  {
    "id": 1,
    "title": "Complete project report",
    "description": "Quarterly report for Q1 2026",
    "dueDate": "2026-02-25",
    "status": "pending",
    "createdAt": "2026-02-20T10:00:00Z",
    "updatedAt": "2026-02-20T10:00:00Z"
  }
]
```

**After (Enhanced with computed fields)**:
```json
[
  {
    "id": 1,
    "title": "Complete project report",
    "description": "Quarterly report for Q1 2026",
    "dueDate": "2026-02-25",
    "status": "pending",
    "createdAt": "2026-02-20T10:00:00Z",
    "updatedAt": "2026-02-20T10:00:00Z",
    "isOverdue": true,
    "overdueDays": 2,
    "overdueDuration": "2 days"
  }
]
```

**Computed Field Rules**:
- `isOverdue`: Always included (boolean)
- `overdueDays`: Included only if `isOverdue == true`, otherwise `null`
- `overdueDuration`: Included only if `isOverdue == true`, otherwise `null`

---

## Edge Cases & Special Scenarios

### 1. Todo Due Today (Not Overdue Yet)
```javascript
// Today: 2026-02-27
const todo = {
  dueDate: '2026-02-27',
  status: 'pending'
};
// Result: isOverdue = false (due today is not overdue)
```

### 2. Completed Task After Due Date (Not Overdue)
```javascript
// Today: 2026-02-27
const todo = {
  dueDate: '2026-02-25',
  status: 'completed',
  updatedAt: '2026-02-26'  // Completed after due date
};
// Result: isOverdue = false (completed tasks never show as overdue)
```

### 3. No Due Date (Cannot Be Overdue)
```javascript
const todo = {
  dueDate: null,
  status: 'pending'
};
// Result: isOverdue = false, overdueDays = null
```

### 4. Date Calculation Failure (Graceful Degradation)
```javascript
const todo = {
  dueDate: 'invalid-date',
  status: 'pending'
};
// Result: isOverdue = false, overdueDays = null (error logged)
```

### 5. Very Old Overdue Item (1+ Year)
```javascript
// Today: 2026-02-27
const todo = {
  dueDate: '2024-12-01',
  status: 'pending'
};
// Result: isOverdue = true, overdueDays = 452, overdueDuration = "1+ year"
```

---

## Performance Considerations

**Calculation Cost**:
- `isOverdue`: O(1) - Single date comparison
- `overdueDays`: O(1) - Single date subtraction
- Per-todo cost: ~0.001ms
- 1000 todos: ~1ms total (well under 1s requirement)

**Optimization Strategy**:
- No caching needed at current scale
- Compute on-demand during API response serialization
- Monitor performance metrics; optimize only if needed

**Future Optimization (if scale increases)**:
- Memoize "today's date" (compute once per request, not per todo)
- Server-side filtering to reduce payload size
- Database indexing on `dueDate` for filtering queries

---

## Testing Strategy

### Unit Test Cases

1. **isOverdue Logic**:
   - ✅ Todo with past due date and pending status → overdue
   - ✅ Todo with today's due date and pending status → NOT overdue
   - ✅ Todo with future due date and pending status → NOT overdue
   - ✅ Todo with past due date and completed status → NOT overdue
   - ✅ Todo with null due date → NOT overdue
   - ✅ Todo with invalid due date → NOT overdue (error logged)

2. **overdueDays Calculation**:
   - ✅ 1 day overdue → 1
   - ✅ 7 days overdue → 7
   - ✅ 30 days overdue → 30
   - ✅ 31 days overdue → 31
   - ✅ 365 days overdue → 365
   - ✅ Not overdue → null

3. **overdueDuration Formatting**:
   - ✅ 1 day → "1 day"
   - ✅ 7 days → "7 days"
   - ✅ 30 days → "30 days"
   - ✅ 31 days → "1 month"
   - ✅ 60 days → "2 months"
   - ✅ 365 days → "1+ year"

### Integration Test Cases

1. **API Response Enhancement**:
   - ✅ GET /api/todos returns computed overdue fields
   - ✅ Computed fields update when due date changes
   - ✅ Computed fields update when status changes
   - ✅ Todos without due dates have `isOverdue = false`

---

## Migration Plan

**Migration Required**: NO

**Reason**: All necessary database fields already exist. This feature only adds computed properties calculated at runtime.

**Deployment Impact**: NONE

- No database schema changes
- No data migration needed
- Backward compatible (old clients ignore new fields)
- Forward compatible (new computed fields always calculated)

---

## References

- Feature Specification: [spec.md](spec.md)
- Research Document: [research.md](research.md)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
