---
description: "Task list for Overdue Todo Items feature implementation"
---

# Tasks: Overdue Todo Items Feature

**Input**: Design documents from `/specs/001-overdue-todos/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contract.md  
**Branch**: `001-overdue-todos`  
**Date**: February 27, 2026

**Tests**: This feature follows TDD approach - tests are written FIRST and must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and dependencies are ready

- [ ] T001 Verify existing project structure matches `/specs/001-overdue-todos/plan.md`
- [ ] T002 Ensure all dependencies are installed per package.json (backend and frontend)
- [ ] T003 Verify baseline tests pass by running `npm test` from workspace root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core date handling utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Date Utilities Tests (Write FIRST - Must FAIL)

- [ ] T004 [P] Write unit tests for `isOverdue()` in `packages/backend/__tests__/services/todoService.test.js`
- [ ] T005 [P] Write unit tests for `getOverdueDays()` in `packages/backend/__tests__/services/todoService.test.js`
- [ ] T006 [P] Write unit tests for `formatOverdueDuration()` in `packages/backend/__tests__/services/todoService.test.js`

### Backend Date Utilities Implementation

- [ ] T007 Implement `isOverdue()` function in `packages/backend/src/services/todoService.js`
- [ ] T008 Implement `getOverdueDays()` function in `packages/backend/src/services/todoService.js`
- [ ] T009 Implement `formatOverdueDuration()` function in `packages/backend/src/services/todoService.js`
- [ ] T010 Implement `enhanceTodoWithOverdueFields()` helper in `packages/backend/src/services/todoService.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visual Identification of Overdue Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can immediately identify which tasks are overdue through visual indicators (icon + text) so they can prioritize urgent items first.

**Independent Test**: Create todos with past due dates and verify distinct visual indicators display without requiring other functionality.

**Acceptance Criteria**:
- ✅ Incomplete todo with past due date shows overdue indicator
- ✅ Todo due today does NOT show as overdue
- ✅ Completed todo with past due date does NOT show as overdue
- ✅ Todo with no due date does NOT show as overdue
- ✅ Multiple todos display overdue status correctly

### Backend API Enhancement Tests (Write FIRST - Must FAIL)

- [ ] T011 [P] [US1] Write API integration test for GET /api/todos returning computed overdue fields in `packages/backend/__tests__/app.test.js`
- [ ] T012 [P] [US1] Write API integration test for GET /api/todos/:id returning computed overdue fields in `packages/backend/__tests__/app.test.js`
- [ ] T013 [P] [US1] Write API integration test for POST /api/todos returning computed overdue fields in `packages/backend/__tests__/app.test.js`
- [ ] T014 [P] [US1] Write API integration test for PUT /api/todos/:id recalculating overdue fields in `packages/backend/__tests__/app.test.js`

### Backend API Enhancement Implementation

- [ ] T015 [US1] Enhance GET /api/todos endpoint to include computed overdue fields in `packages/backend/src/app.js`
- [ ] T016 [US1] Enhance GET /api/todos/:id endpoint to include computed overdue fields in `packages/backend/src/app.js`
- [ ] T017 [US1] Enhance POST /api/todos endpoint to include computed overdue fields in `packages/backend/src/app.js`
- [ ] T018 [US1] Enhance PUT /api/todos/:id endpoint to recalculate overdue fields in `packages/backend/src/app.js`

### Frontend Component Tests (Write FIRST - Must FAIL)

- [ ] T019 [P] [US1] Write component tests for OverdueIndicator in `packages/frontend/src/components/__tests__/OverdueIndicator.test.js`
- [ ] T020 [P] [US1] Write updated TodoCard tests including OverdueIndicator in `packages/frontend/src/components/__tests__/TodoCard.test.js`

### Frontend Component Implementation

- [ ] T021 [US1] Create OverdueIndicator component in `packages/frontend/src/components/OverdueIndicator.js`
- [ ] T022 [US1] Create OverdueIndicator styles with accessibility (icon + text, WCAG AA contrast) in `packages/frontend/src/components/OverdueIndicator.css`
- [ ] T023 [US1] Integrate OverdueIndicator into TodoCard component in `packages/frontend/src/components/TodoCard.js`
- [ ] T024 [US1] Update TodoCard styles for overdue indicator layout in `packages/frontend/src/components/TodoCard.css`

### Integration Validation

- [ ] T025 [US1] Manual testing: Create todos with various overdue states per quickstart.md test scenarios
- [ ] T026 [US1] Accessibility testing: Verify screen reader announcements and ARIA labels
- [ ] T027 [US1] Visual testing: Verify indicator works in both light and dark themes

**Checkpoint**: User Story 1 (MVP) is complete - overdue tasks are visually identifiable

---

## Phase 4: User Story 2 - Overdue Duration Context (Priority: P2)

**Goal**: Users can see how long each task has been overdue (duration display) to understand urgency level and prioritize accordingly.

**Independent Test**: Create overdue todos with various past dates and verify duration display is accurate and formatted correctly.

**Acceptance Criteria**:
- ✅ 1 day overdue shows "1 day overdue"
- ✅ 7 days overdue shows "7 days overdue"
- ✅ 30 days overdue shows "30 days overdue"
- ✅ 31+ days shows "X months overdue"
- ✅ Duration updates when viewing on different days

**Note**: Backend foundation (T007-T010) already implemented duration calculation. This phase focuses on ensuring the display is complete.

### Frontend Enhancement Tests (Write FIRST - Must FAIL)

- [ ] T028 [P] [US2] Write tests for duration formatting display in OverdueIndicator in `packages/frontend/src/components/__tests__/OverdueIndicator.test.js`

### Frontend Enhancement Implementation

- [ ] T029 [US2] Verify OverdueIndicator displays `overdueDuration` prop correctly in `packages/frontend/src/components/OverdueIndicator.js`
- [ ] T030 [US2] Update OverdueIndicator styles for duration text formatting in `packages/frontend/src/components/OverdueIndicator.css`

### Integration Validation

- [ ] T031 [US2] Manual testing: Verify duration display for 1 day, 7 days, 30 days, 31 days, 365+ days
- [ ] T032 [US2] Edge case testing: Verify very old overdue items display "1+ year"

**Checkpoint**: User Story 2 is complete - users see clear duration context for overdue items

---

## Phase 5: User Story 3 - Filter and Sort by Overdue Status (Priority: P3)

**Goal**: Users with many todos can filter to show only overdue items and sort by how long they've been overdue to focus on catching up.

**Independent Test**: Create mix of overdue and non-overdue todos, apply overdue filter, verify only overdue items appear in correct sort order.

**Acceptance Criteria**:
- ✅ Overdue filter shows only incomplete todos with past due dates
- ✅ Sort by "most overdue first" orders by oldest due date
- ✅ Completing an overdue todo removes it from filtered view
- ✅ No overdue todos shows "No overdue todos" message

### Backend API Tests (Write FIRST - Must FAIL)

- [ ] T033 [P] [US3] Write API integration test for GET /api/todos?filter=overdue in `packages/backend/__tests__/app.test.js`
- [ ] T034 [P] [US3] Write API integration test for GET /api/todos?sort=overdue-desc in `packages/backend/__tests__/app.test.js`

### Backend API Implementation

- [ ] T035 [US3] Add query parameter support for filter=overdue to GET /api/todos in `packages/backend/src/app.js`
- [ ] T036 [US3] Add query parameter support for sort=overdue-desc to GET /api/todos in `packages/backend/src/app.js`
- [ ] T037 [US3] Update todoService to support filtering by overdue status in `packages/backend/src/services/todoService.js`
- [ ] T038 [US3] Update todoService to support sorting by overdue duration in `packages/backend/src/services/todoService.js`

### Frontend Component Tests (Write FIRST - Must FAIL)

- [ ] T039 [P] [US3] Write tests for filter controls in TodoList in `packages/frontend/src/components/__tests__/TodoList.test.js`
- [ ] T040 [P] [US3] Write tests for sort controls in TodoList in `packages/frontend/src/components/__tests__/TodoList.test.js`
- [ ] T041 [P] [US3] Write tests for empty state "No overdue todos" in TodoList in `packages/frontend/src/components/__tests__/TodoList.test.js`

### Frontend Component Implementation

- [ ] T042 [US3] Add filter dropdown UI to TodoList component in `packages/frontend/src/components/TodoList.js`
- [ ] T043 [US3] Add sort dropdown UI to TodoList component in `packages/frontend/src/components/TodoList.js`
- [ ] T044 [US3] Implement filter logic to call API with filter=overdue in `packages/frontend/src/services/todoService.js`
- [ ] T045 [US3] Implement sort logic to call API with sort=overdue-desc in `packages/frontend/src/services/todoService.js`
- [ ] T046 [US3] Add "No overdue todos" empty state message to TodoList in `packages/frontend/src/components/TodoList.js`
- [ ] T047 [US3] Add styles for filter/sort controls in `packages/frontend/src/components/TodoList.css`

### Integration Validation

- [ ] T048 [US3] Manual testing: Apply overdue filter and verify correct filtering
- [ ] T049 [US3] Manual testing: Apply sort and verify correct ordering
- [ ] T050 [US3] Manual testing: Complete overdue todo while filter active, verify removal
- [ ] T051 [US3] Accessibility testing: Verify filter/sort controls are keyboard accessible

**Checkpoint**: User Story 3 is complete - users can filter and sort overdue items efficiently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T052 [P] Performance testing: Verify overdue calculation for 1000 todos completes in <1 second
- [ ] T053 [P] Update API documentation in contracts/api-contract.md with final implementation details
- [ ] T054 [P] Add code comments for date handling functions per coding guidelines
- [ ] T055 Verify all tests pass: Run `npm test` from workspace root (target: 80%+ coverage)
- [ ] T056 Code cleanup: Remove any console.logs and debugging code
- [ ] T057 Run full quickstart.md validation workflow
- [ ] T058 Update README.md with overdue feature documentation (if project README exists)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
    ├─→ Phase 3 (User Story 1 - P1) 🎯 MVP
    ├─→ Phase 4 (User Story 2 - P2)
    └─→ Phase 5 (User Story 3 - P3)
    ↓
Phase 6 (Polish)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends ONLY on Foundational phase - No dependencies on other stories ✅ Can start immediately after Phase 2
- **User Story 2 (P2)**: Depends ONLY on Foundational phase - No dependencies on other stories ✅ Can start immediately after Phase 2 (but P1 has higher priority)
- **User Story 3 (P3)**: Depends ONLY on Foundational phase - No dependencies on other stories ✅ Can start immediately after Phase 2 (but P1/P2 have higher priority)

### Within Each Phase

**Phase 2 (Foundational)**:
1. Write all tests first (T004-T006) - can run in parallel [P]
2. Implement after tests fail (T007-T010) - sequential

**Phase 3 (User Story 1)**:
1. Backend tests first (T011-T014) - can run in parallel [P]
2. Backend implementation (T015-T018) - sequential, depends on tests
3. Frontend tests (T019-T020) - can run in parallel [P], depends on backend complete
4. Frontend implementation (T021-T024) - sequential, depends on tests
5. Integration validation (T025-T027) - sequential, depends on all implementation

**Phase 4 (User Story 2)**:
1. Frontend tests first (T028) - can run in parallel [P]
2. Frontend enhancement (T029-T030) - sequential
3. Integration validation (T031-T032) - sequential

**Phase 5 (User Story 3)**:
1. Backend tests first (T033-T034) - can run in parallel [P]
2. Backend implementation (T035-T038) - sequential
3. Frontend tests (T039-T041) - can run in parallel [P]
4. Frontend implementation (T042-T047) - sequential
5. Integration validation (T048-T051) - sequential

### Parallel Opportunities

#### Within Foundational Phase (After Setup)

```bash
# All test tasks can launch together:
T004: Write unit tests for isOverdue()
T005: Write unit tests for getOverdueDays()
T006: Write unit tests for formatOverdueDuration()
```

#### Within User Story 1 (Backend Tests)

```bash
# All backend API tests can launch together:
T011: API test for GET /api/todos
T012: API test for GET /api/todos/:id
T013: API test for POST /api/todos
T014: API test for PUT /api/todos/:id
```

#### Within User Story 1 (Frontend Tests)

```bash
# Frontend component tests can launch together:
T019: OverdueIndicator component tests
T020: Updated TodoCard tests
```

#### Within User Story 3 (Backend Tests)

```bash
# Backend API tests can launch together:
T033: API test for filter=overdue
T034: API test for sort=overdue-desc
```

#### Within User Story 3 (Frontend Tests)

```bash
# Frontend tests can launch together:
T039: Filter controls tests
T040: Sort controls tests
T041: Empty state tests
```

#### Across User Stories (After Foundational Complete)

With multiple developers, these can proceed in parallel:
- Developer A: Phase 3 (User Story 1) - MVP implementation
- Developer B: Phase 4 (User Story 2) - Duration context
- Developer C: Phase 5 (User Story 3) - Filtering/sorting

**However**: Priority order P1 → P2 → P3 means User Story 1 should complete first for MVP delivery.

---

## Implementation Strategy

### MVP First (Recommended)

**Goal**: Deliver core value as quickly as possible

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (CRITICAL - blocks everything)
3. ✅ Complete Phase 3: User Story 1 (P1) - Visual indicators
4. **STOP and VALIDATE**: Test User Story 1 independently
5. **DEPLOY MVP**: Users can now see overdue todos
6. Optional: Continue with P2/P3 based on feedback

**MVP Scope**: Tasks T001-T027 (27 tasks)

### Incremental Delivery

**Goal**: Add value progressively, test each story independently

1. ✅ Setup + Foundational → Foundation ready
2. ✅ Add User Story 1 (P1) → Test independently → **Deploy/Demo MVP**
3. ✅ Add User Story 2 (P2) → Test independently → **Deploy/Demo Enhanced**
4. ✅ Add User Story 3 (P3) → Test independently → **Deploy/Demo Complete**
5. ✅ Polish → Final refinements

**Benefit**: Each phase adds value without breaking previous functionality

### Parallel Team Strategy

**Goal**: Maximum velocity with multiple developers

With 3+ developers after Foundational phase completes:
- **Developer A**: User Story 1 (T011-T027) - Focus on MVP
- **Developer B**: User Story 2 (T028-T032) - Enhance duration display
- **Developer C**: User Story 3 (T033-T051) - Add filtering/sorting

**Coordination Points**:
- All devs wait for Foundational phase (T004-T010) to complete
- Stories integrate independently - minimal merge conflicts
- Each story has independent test criteria

---

## Task Summary

**Total Tasks**: 58 tasks

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (User Story 1 - P1): 17 tasks 🎯 MVP
- Phase 4 (User Story 2 - P2): 5 tasks
- Phase 5 (User Story 3 - P3): 19 tasks
- Phase 6 (Polish): 7 tasks

**By User Story**:
- User Story 1 (P1): 17 tasks (MVP scope)
- User Story 2 (P2): 5 tasks
- User Story 3 (P3): 19 tasks
- Infrastructure: 17 tasks (Setup + Foundational + Polish)

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phase

**MVP Scope**: 27 tasks (Phases 1-3) deliver core visual identification feature

**Time Estimates**:
- MVP (Phases 1-3): ~4-6 hours (per quickstart.md)
- Full feature (All phases): ~8-12 hours
- With parallel team: ~6-8 hours

---

## Notes

- **[P] marker**: Tasks that can run in parallel (different files, no dependencies)
- **[Story] label**: Maps task to specific user story for traceability and independent testing
- **TDD approach**: All test tasks MUST be written first and FAIL before implementation
- **Independent stories**: Each user story can be tested and deployed independently
- **Accessibility**: WCAG AA compliance checked in User Story 1 validation tasks
- **Performance**: Sub-second requirement validated in Polish phase
- **Coverage target**: 80%+ test coverage maintained throughout

**Format Validation**: ✅ All tasks follow required checklist format:
- Checkbox: `- [ ]`
- Task ID: Sequential (T001-T058)
- [P] marker: Present for parallelizable tasks
- [Story] label: Present for user story phase tasks only
- File paths: Included in all implementation task descriptions

**Constitution Compliance**:
- ✅ Testing Excellence: TDD approach, tests written first
- ✅ Code Quality: Simple date logic, computed properties (DRY)
- ✅ Consistent Standards: Following existing code style
- ✅ Component-First: Reusable OverdueIndicator component
- ✅ UX Priority: WCAG AA compliance, accessibility testing
- ✅ Scope Discipline: Clear P1/P2/P3 priorities, MVP focus
