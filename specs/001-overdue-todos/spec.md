# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todos`  
**Created**: February 27, 2026  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items: Users need a clear, visual way to identify which todos have not been completed by their due date. This helps users quickly spot overdue items without having to manually check dates against today's date."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Identification of Overdue Tasks (Priority: P1)

As a user viewing my todo list, I can immediately identify which tasks are overdue through visual indicators so that I can prioritize addressing the most urgent items first.

**Why this priority**: This is the core value proposition of the feature. Without visual identification, users must manually compare dates, which defeats the purpose of the feature.

**Independent Test**: Can be fully tested by creating todos with past due dates and verifying that they display distinct visual indicators without requiring any other functionality changes.

**Acceptance Scenarios**:

1. **Given** I have a todo with a due date in the past and status is not completed, **When** I view my todo list, **Then** the overdue todo displays with a distinct visual indicator (such as red text or warning icon)
2. **Given** I have a todo with today's date as the due date and status is not completed, **When** I view my todo list, **Then** the todo does NOT show as overdue (due today is not overdue)
3. **Given** I have a todo with a due date in the past but status is completed, **When** I view my todo list, **Then** the todo does NOT show as overdue (completed tasks are never overdue)
4. **Given** I have a todo with no due date set, **When** I view my todo list, **Then** the todo does NOT show as overdue (tasks without due dates cannot be overdue)
5. **Given** I have multiple todos with different due dates (past, today, future), **When** I view my todo list, **Then** only the incomplete todos with past due dates show the overdue indicator

---

### User Story 2 - Overdue Duration Context (Priority: P2)

As a user viewing overdue tasks, I can see how long each task has been overdue so that I can understand the urgency level and prioritize accordingly.

**Why this priority**: Adds valuable context to help users prioritize between multiple overdue items, but the basic visual indicator (P1) is sufficient for MVP.

**Independent Test**: Can be tested independently by creating overdue todos with various past dates and verifying the duration display is accurate and updates correctly.

**Acceptance Scenarios**:

1. **Given** I have a todo that is 1 day overdue, **When** I view the todo, **Then** I see text indicating "1 day overdue"
2. **Given** I have a todo that is 7 days overdue, **When** I view the todo, **Then** I see text indicating "7 days overdue"
3. **Given** I have a todo that is 30 days overdue, **When** I view the todo, **Then** I see text indicating "30 days overdue" or "1 month overdue"
4. **Given** I view my todo list on different days, **When** a todo crosses from "1 day overdue" to "2 days overdue", **Then** the displayed duration updates automatically

---

### User Story 3 - Filter and Sort by Overdue Status (Priority: P3)

As a user with many todos, I can filter to show only overdue items and sort by how long they've been overdue so that I can focus exclusively on catching up on late tasks.

**Why this priority**: Enhances usability for users with many todos but is not essential for the core value - users can still identify overdue items visually even without filtering.

**Independent Test**: Can be tested by creating a mix of overdue and non-overdue todos, applying the overdue filter, and verifying only overdue items appear in the correct sort order.

**Acceptance Scenarios**:

1. **Given** I have both overdue and non-overdue todos, **When** I apply an "overdue only" filter, **Then** I see only the incomplete todos with past due dates
2. **Given** I have multiple overdue todos, **When** I sort by "most overdue first", **Then** todos with the oldest due dates appear at the top
3. **Given** I have an overdue filter active, **When** I complete an overdue todo, **Then** it immediately disappears from the filtered view
4. **Given** I have an overdue filter active and no overdue todos exist, **When** I view the list, **Then** I see a message indicating "No overdue todos"

---

### Edge Cases

- What happens when a todo's due date is set to exactly midnight? (Assumption: A task becomes overdue at 12:00:01 AM the day after the due date)
- How does the system handle timezone differences for due dates? (Assumption: All dates are evaluated in the user's local timezone)
- What if the user changes their system date/time? (Assumption: System recalculates overdue status based on current system datetime whenever the list is viewed)
- How should very old overdue items be displayed? (Assumption: Display up to 365 days as "X days overdue", beyond that show "1+ year overdue")
- What happens if multiple todos have the same due date and all are overdue? (Assumption: They maintain their existing sort order within the overdue group)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST identify a todo as overdue when its due date is before the current date AND the todo status is not completed
- **FR-002**: System MUST NOT mark a todo as overdue if the due date is today's date (due today is not yet overdue)
- **FR-003**: System MUST NOT mark a todo as overdue if the todo has been marked as completed, regardless of due date
- **FR-004**: System MUST NOT mark a todo as overdue if no due date has been set
- **FR-005**: System MUST display overdue todos with a distinct visual indicator using both red text color and a warning icon
- **FR-006**: System MUST calculate overdue duration as the number of days between the due date and the current date
- **FR-007**: System MUST display the overdue duration in a human-readable format (e.g., "2 days overdue")
- **FR-008**: System MUST recalculate overdue status whenever the todo list is displayed or refreshed
- **FR-009**: System MUST update overdue status immediately when a todo is marked as completed or a due date is changed
- **FR-010**: System MUST use the user's local timezone when comparing dates to determine overdue status

### Key Entities

- **Todo**: Represents a task item with attributes including title, description, due date (optional), completion status, and overdue status (computed)
  - Overdue status is a computed property, not stored data - it's calculated by comparing due date to current date
  - Relationship: Overdue determination depends on both the due date field and completion status field

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify overdue tasks within 2 seconds of viewing the todo list without reading individual due dates
- **SC-002**: 95% of users successfully identify which tasks are overdue in user testing without instruction
- **SC-003**: Users can understand how long a task has been overdue without manually calculating date differences
- **SC-004**: The overdue indicator updates in real-time (within 1 second) when a task's status or due date changes

## Assumptions

- The todo application already supports due dates on todo items
- The system has access to the current date and time
- Users understand the concept of "due date" and "overdue"
- The application displays in the user's local timezone
- A task due "today" is not considered overdue until tomorrow
- Tasks without due dates cannot be overdue (cannot be late if there's no deadline)
- Completed tasks are never displayed as overdue, regardless of when they were completed
- Visual indicators will be consistent across all views where todos are displayed (list view, card view, etc.)
- The application is used primarily on devices with accurate system clocks
