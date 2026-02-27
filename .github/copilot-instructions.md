# GitHub Copilot Instructions

> **Note**: This file is located at `.github/copilot-instructions.md` and is used by GitHub Copilot to understand project context.

This file contains high-level instructions for GitHub Copilot to follow when generating code for this project. For detailed guidance, refer to the documentation files in the `docs/` directory.

## Documentation Overview

The project documentation will be built during the bootcamp sessions.

- [Project Overview](../docs/project-overview.md) - Overview of the project
- [Coding Guidelines](../docs/coding-guidelines.md) - Coding style, quality principles, and best practices
- [Functional Requirements](../docs/functional-requirements.md) - Core functional requirements for the todo app
- [UI Guidelines](../docs/ui-guidelines.md) - Design system and UI guidelines for the todo app
- [Testing Guidelines](../docs/testing-guidelines.md) - Testing strategy and best practices

## Active Feature Development

### Overdue Todo Items (Branch: 001-overdue-todos)

**Status**: Planning Complete (Phase 1)  
**Spec**: [specs/001-overdue-todos/spec.md](../specs/001-overdue-todos/spec.md)

This feature adds visual indicators and duration information for incomplete todos past their due date.

**Key Technologies & Patterns**:
- **Date Handling**: Native JavaScript `Date` objects (no external libraries)
- **Computed Properties**: Overdue status calculated dynamically (not stored in DB)
- **Accessibility**: WCAG AA compliance with non-color-only indicators and ARIA labels
- **Testing**: Jest with `useFakeTimers()` for deterministic date testing
- **Architecture**: Reusable `OverdueIndicator` component (React)

**Implementation Documents**:
- [Plan](../specs/001-overdue-todos/plan.md) - Implementation approach and structure
- [Research](../specs/001-overdue-todos/research.md) - Technical decisions and best practices
- [Data Model](../specs/001-overdue-todos/data-model.md) - Entity structure and computed fields
- [API Contract](../specs/001-overdue-todos/contracts/api-contract.md) - REST API changes
- [Quickstart](../specs/001-overdue-todos/quickstart.md) - Development guide and code examples

**Key Decisions**:
- No external date libraries (moment.js, date-fns) → use native Date objects
- Overdue status is computed on-demand, not stored in database
- Combine visual indicators (icon + text) for accessibility
- Test date-dependent logic using Jest timer mocks

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
