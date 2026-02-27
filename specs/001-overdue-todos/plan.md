# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: February 27, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Users need a clear visual way to identify incomplete todos that have not been completed by their due date. The system will compute overdue status by comparing the due date with the current date and display distinct visual indicators (icons + text) along with duration information. The feature includes three priority tiers: P1 visual identification, P2 duration context, and P3 filtering/sorting capabilities.

## Technical Context

**Language/Version**: JavaScript (Node.js 18+ for backend, React 18.2.0 for frontend)  
**Primary Dependencies**: Express 4.18.2, React 18.2.0, axios 1.6.2, better-sqlite3 11.10.0  
**Storage**: SQLite database (better-sqlite3)  
**Testing**: Jest 29.7.0 (backend) + React Testing Library (frontend)  
**Target Platform**: Web application (desktop-focused, responsive design)
**Project Type**: Full-stack web application with REST API  
**Performance Goals**: <1 second to calculate overdue status for up to 1000 todos  
**Constraints**: 80%+ test coverage, <1s overdue calculation, WCAG AA accessibility compliance  
**Scale/Scope**: Single-user application, up to 1000 todos, desktop-focused with responsive design

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Testing Excellence** | ✅ PASS | Feature follows TDD; tests will be written first; target 80%+ coverage maintained |
| **II. Code Quality & Simplicity** | ✅ PASS | Straightforward date comparison logic; computed property pattern (DRY); minimal complexity |
| **III. Consistent Standards** | ✅ PASS | Following existing code style (2-space indent, camelCase, ESLint compliance) |
| **IV. Component-First Architecture** | ✅ PASS | Reusable OverdueIndicator component; separate overdue logic into service; single responsibility |
| **V. User Experience Priority** | ✅ PASS | Spec explicitly requires WCAG AA compliance; non-color-only indicators (icon + text); accessibility focused |
| **VI. Scope Discipline** | ✅ PASS | Well-defined scope with P1/P2/P3 priorities; clear boundaries; no authentication or advanced features |

**Overall Gate**: ✅ **PASS** - No violations requiring justification. Feature aligns with all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   ├── src/
│   │   ├── app.js            # Express app setup
│   │   ├── index.js          # Server entry point
│   │   └── services/
│   │       └── todoService.js  # Todo CRUD + overdue calculation logic
│   └── __tests__/
│       └── app.test.js       # API integration tests
│
└── frontend/
    ├── src/
    │   ├── App.js            # Main app component
    │   ├── components/
    │   │   ├── TodoCard.js   # Individual todo display (add overdue indicator)
    │   │   ├── TodoList.js   # Todo list display
    │   │   └── OverdueIndicator.js  # NEW: Reusable overdue visual component
    │   └── services/
    │       └── todoService.js  # Frontend API client
    └── __tests__/
        └── components/
            └── OverdueIndicator.test.js  # NEW: Component tests
```

**Structure Decision**: Using existing monorepo structure (packages/frontend + packages/backend). The overdue logic will be computed in the backend service layer and exposed via existing REST API. Frontend will create a new reusable OverdueIndicator component to display status across all todo views.

## Complexity Tracking

> **No complexity justifications required** - All constitutional principles pass without violations.
