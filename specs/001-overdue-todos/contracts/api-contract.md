# API Contract: Overdue Todo Items

**Date**: February 27, 2026  
**Feature**: Support for Overdue Todo Items  
**Branch**: `001-overdue-todos`  
**Base URL**: `http://localhost:3030/api`

## Overview

This document defines the REST API contract changes for the overdue todos feature. All existing endpoints remain backward compatible; this feature only **enhances** the response payload with computed overdue fields.

**Contract Version**: 1.1.0 (adds computed fields to existing v1.0.0 responses)

---

## Affected Endpoints

### 1. GET /api/todos

**Purpose**: Retrieve all todos with computed overdue status

**Method**: `GET`

**URL**: `/api/todos`

**Authentication**: None (single-user application)

**Request**:
- **Headers**: None required
- **Query Parameters**: None (filtering added in P3 priority, not MVP)
- **Body**: None

**Response** (200 OK):

```json
{
  "todos": [
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
    },
    {
      "id": 2,
      "title": "Review pull requests",
      "description": null,
      "dueDate": "2026-03-01",
      "status": "pending",
      "createdAt": "2026-02-26T14:30:00Z",
      "updatedAt": "2026-02-26T14:30:00Z",
      "isOverdue": false,
      "overdueDays": null,
      "overdueDuration": null
    },
    {
      "id": 3,
      "title": "Update documentation",
      "description": "Add API examples",
      "dueDate": "2026-02-24",
      "status": "completed",
      "createdAt": "2026-02-20T09:00:00Z",
      "updatedAt": "2026-02-25T16:00:00Z",
      "isOverdue": false,
      "overdueDays": null,
      "overdueDuration": null
    },
    {
      "id": 4,
      "title": "Brainstorm ideas",
      "description": "No deadline",
      "dueDate": null,
      "status": "pending",
      "createdAt": "2026-02-27T08:00:00Z",
      "updatedAt": "2026-02-27T08:00:00Z",
      "isOverdue": false,
      "overdueDays": null,
      "overdueDuration": null
    }
  ]
}
```

**Response Schema**:

| Field Path | Type | Required | Description |
|------------|------|----------|-------------|
| `todos` | Array | YES | Array of todo objects |
| `todos[].id` | Number | YES | Unique todo identifier |
| `todos[].title` | String | YES | Todo title |
| `todos[].description` | String | NO | Todo description (nullable) |
| `todos[].dueDate` | String (ISO 8601) | NO | Due date in YYYY-MM-DD format (nullable) |
| `todos[].status` | String (Enum) | YES | `"pending"` or `"completed"` |
| `todos[].createdAt` | String (ISO 8601) | YES | Creation timestamp |
| `todos[].updatedAt` | String (ISO 8601) | YES | Last update timestamp |
| `todos[].isOverdue` | Boolean | YES | **NEW**: True if overdue, false otherwise |
| `todos[].overdueDays` | Number | NO | **NEW**: Days overdue (null if not overdue) |
| `todos[].overdueDuration` | String | NO | **NEW**: Human-readable duration (null if not overdue) |

**Error Responses**:
- `500 Internal Server Error`: Server error during computation

**Example cURL**:
```bash
curl -X GET http://localhost:3030/api/todos
```

**Backward Compatibility**: ✅ YES
- Existing clients can safely ignore new `isOverdue`, `overdueDays`, `overdueDuration` fields
- All existing fields remain unchanged

---

### 2. GET /api/todos/:id

**Purpose**: Retrieve a single todo by ID with computed overdue status

**Method**: `GET`

**URL**: `/api/todos/:id`

**Authentication**: None

**Request**:
- **URL Parameters**: 
  - `id` (required): Integer todo ID
- **Headers**: None required
- **Body**: None

**Response** (200 OK):

```json
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
```

**Response Schema**: Same as individual todo object in GET /api/todos

**Error Responses**:
- `404 Not Found`: Todo with specified ID does not exist
- `500 Internal Server Error`: Server error during computation

**Example cURL**:
```bash
curl -X GET http://localhost:3030/api/todos/1
```

**Backward Compatibility**: ✅ YES

---

### 3. POST /api/todos

**Purpose**: Create a new todo (overdue fields computed in response)

**Method**: `POST`

**URL**: `/api/todos`

**Authentication**: None

**Request**:
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:

```json
{
  "title": "New todo item",
  "description": "Optional description",
  "dueDate": "2026-02-25",
  "status": "pending"
}
```

**Request Schema**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | String | YES | - | Todo title (max 255 chars) |
| `description` | String | NO | null | Todo description |
| `dueDate` | String (ISO 8601) | NO | null | Due date in YYYY-MM-DD format |
| `status` | String (Enum) | NO | "pending" | `"pending"` or `"completed"` |

**Response** (201 Created):

```json
{
  "id": 5,
  "title": "New todo item",
  "description": "Optional description",
  "dueDate": "2026-02-25",
  "status": "pending",
  "createdAt": "2026-02-27T12:00:00Z",
  "updatedAt": "2026-02-27T12:00:00Z",
  "isOverdue": true,
  "overdueDays": 2,
  "overdueDuration": "2 days"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body (missing title, invalid date format, invalid status)
- `500 Internal Server Error`: Server error during creation

**Example cURL**:
```bash
curl -X POST http://localhost:3030/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New todo item",
    "dueDate": "2026-02-25"
  }'
```

**Backward Compatibility**: ✅ YES
- Request payload unchanged
- Response enhanced with computed fields

---

### 4. PUT /api/todos/:id

**Purpose**: Update an existing todo (overdue fields recomputed in response)

**Method**: `PUT`

**URL**: `/api/todos/:id`

**Authentication**: None

**Request**:
- **URL Parameters**:
  - `id` (required): Integer todo ID
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:

```json
{
  "title": "Updated todo title",
  "description": "Updated description",
  "dueDate": "2026-03-01",
  "status": "completed"
}
```

**Request Schema**: Same as POST /api/todos (all fields optional for update)

**Response** (200 OK):

```json
{
  "id": 1,
  "title": "Updated todo title",
  "description": "Updated description",
  "dueDate": "2026-03-01",
  "status": "completed",
  "createdAt": "2026-02-20T10:00:00Z",
  "updatedAt": "2026-02-27T12:15:00Z",
  "isOverdue": false,
  "overdueDays": null,
  "overdueDuration": null
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body (invalid date format, invalid status)
- `404 Not Found`: Todo with specified ID does not exist
- `500 Internal Server Error`: Server error during update

**Example cURL**:
```bash
curl -X PUT http://localhost:3030/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

**Backward Compatibility**: ✅ YES

**Key Behavior**: 
- When `status` is updated to `"completed"`, `isOverdue` immediately becomes `false`
- When `dueDate` is updated, `isOverdue` is recalculated against current date

---

### 5. DELETE /api/todos/:id

**Purpose**: Delete a todo

**Method**: `DELETE`

**URL**: `/api/todos/:id`

**Authentication**: None

**Request**:
- **URL Parameters**:
  - `id` (required): Integer todo ID
- **Headers**: None required
- **Body**: None

**Response** (204 No Content):
- Empty response body

**Error Responses**:
- `404 Not Found`: Todo with specified ID does not exist
- `500 Internal Server Error`: Server error during deletion

**Example cURL**:
```bash
curl -X DELETE http://localhost:3030/api/todos/1
```

**Changes**: NONE (delete endpoint unaffected by overdue feature)

---

## Computed Field Calculation Rules

### isOverdue

**Type**: Boolean

**Always Present**: Yes

**Calculation Logic**:
```javascript
isOverdue = (dueDate != null) 
         && (status != "completed") 
         && (dueDate < currentDate)
```

**Truth Table**:

| dueDate | status | Date Comparison | isOverdue |
|---------|--------|-----------------|-----------|
| null | pending | N/A | false |
| null | completed | N/A | false |
| past | pending | dueDate < today | true |
| past | completed | dueDate < today | false |
| today | pending | dueDate = today | false |
| future | pending | dueDate > today | false |

---

### overdueDays

**Type**: Number (integer) or null

**Present When**: `isOverdue === true`

**Calculation Logic**:
```javascript
if (isOverdue) {
  overdueDays = Math.floor((currentDate - dueDate) / (24 * 60 * 60 * 1000))
} else {
  overdueDays = null
}
```

**Always >= 1**: If `isOverdue === true`, then `overdueDays >= 1` (minimum 1 day overdue)

---

### overdueDuration

**Type**: String or null

**Present When**: `isOverdue === true`

**Formatting Rules**:

| overdueDays Range | Format | Example |
|-------------------|--------|---------|
| 1 | "1 day" | "1 day" |
| 2-30 | "X days" | "7 days" |
| 31-60 | "1 month" or "2 months" | "1 month" |
| 61-364 | "X months" | "5 months" |
| 365+ | "1+ year" | "1+ year" |

**Month Calculation**: `months = Math.floor(overdueDays / 30)`

**Calculation Logic**:
```javascript
if (!isOverdue) return null;

if (overdueDays >= 365) {
  return "1+ year";
} else if (overdueDays >= 31) {
  const months = Math.floor(overdueDays / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
} else {
  return `${days} day${days > 1 ? 's' : ''}`;
}
```

---

## Date Handling Specifications

### Date Format

**ISO 8601**: YYYY-MM-DD (e.g., "2026-02-27")

**Timezone**: 
- Stored in UTC in database
- Compared as local date (day-level precision, ignoring time)
- Normalized to midnight (00:00:00) for comparison

### Date Comparison Logic

```javascript
// Normalize dates to day-level precision
const today = new Date();
today.setHours(0, 0, 0, 0);

const dueDate = new Date(todo.dueDate);
dueDate.setHours(0, 0, 0, 0);

// Compare
const isOverdue = dueDate < today;
```

**Key Points**:
- A todo due "today" is NOT overdue (due date = current date)
- A todo becomes overdue at 00:00:01 the day after the due date
- Time component is ignored (only date matters)

---

## Error Handling

### Invalid Date Format

**Request**:
```json
{
  "title": "Test todo",
  "dueDate": "invalid-date"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

---

### Date Calculation Failure (Corrupted Data)

**Scenario**: Database contains unparseable date string

**Behavior**: 
- Todo returned with `isOverdue = false`
- `overdueDays = null`
- `overdueDuration = null`
- Error logged server-side (silent to user)

**Example Response** (200 OK):
```json
{
  "id": 99,
  "title": "Corrupted todo",
  "dueDate": "corrupted-value-in-db",
  "status": "pending",
  "isOverdue": false,
  "overdueDays": null,
  "overdueDuration": null
}
```

---

## Testing Contract Compliance

### Test Cases for API Contract

1. **GET /api/todos - Multiple Overdue States**
   - ✅ Returns todos with mixed overdue states
   - ✅ `isOverdue` is boolean for all todos
   - ✅ `overdueDays` is null for non-overdue todos
   - ✅ `overdueDuration` matches expected format

2. **GET /api/todos/:id - Single Todo**
   - ✅ Computed fields present
   - ✅ Values match GET /api/todos for same todo

3. **POST /api/todos - New Overdue Todo**
   - ✅ Create todo with past due date
   - ✅ Response includes `isOverdue = true`
   - ✅ `overdueDays` calculated correctly

4. **PUT /api/todos/:id - Status Change**
   - ✅ Update overdue todo to completed
   - ✅ Response has `isOverdue = false` immediately

5. **PUT /api/todos/:id - Due Date Change**
   - ✅ Update due date to future date
   - ✅ Response has `isOverdue = false`
   - ✅ Update due date to past date
   - ✅ Response has `isOverdue = true`

6. **Edge Cases**
   - ✅ Todo due today → `isOverdue = false`
   - ✅ Todo without due date → `isOverdue = false`
   - ✅ Completed todo with past due date → `isOverdue = false`

---

## Backward Compatibility Guarantee

**Version**: 1.1.0 (backward compatible with 1.0.0)

**Breaking Changes**: NONE

**New Fields**: 
- `isOverdue` (always present)
- `overdueDays` (nullable)
- `overdueDuration` (nullable)

**Client Upgrade Path**:
1. **Old Clients (v1.0.0)**: Ignore new fields; API still functional
2. **New Clients (v1.1.0)**: Use new computed fields for overdue display

**Server Compatibility**:
- Supports both old and new clients simultaneously
- No version negotiation required

---

## Performance Contract

**Response Time**: 
- GET /api/todos (1000 todos): < 1000ms (target: < 100ms)
- GET /api/todos/:id: < 50ms
- POST /api/todos: < 100ms
- PUT /api/todos/:id: < 100ms

**Computation Cost**:
- Per-todo overdue calculation: ~0.001ms
- 1000 todos: ~1ms total computation time

**Throughput**: No change from existing API throughput

---

## Future Extensions (Out of Scope)

The following are NOT included in this contract version:

- ❌ Filter by overdue status (GET /api/todos?overdue=true) - P3 priority
- ❌ Sort by overdue duration (GET /api/todos?sort=overdue) - P3 priority  
- ❌ Bulk operations - Out of scope per constitution
- ❌ Overdue notifications - Out of scope (no reminders)

---

## References

- Feature Specification: [spec.md](../spec.md)
- Data Model: [data-model.md](../data-model.md)
- Research: [research.md](../research.md)
- Constitution: [.specify/memory/constitution.md](../../../.specify/memory/constitution.md)

---

## Changelog

### Version 1.1.0 (2026-02-27)
- ➕ Added `isOverdue` computed field to all todo responses
- ➕ Added `overdueDays` computed field to all todo responses
- ➕ Added `overdueDuration` computed field to all todo responses
- ✅ Backward compatible with v1.0.0 clients
