import React from 'react';
import './OverdueIndicator.css';

/**
 * OverdueIndicator Component
 * 
 * Displays a visual indicator for overdue todos with icon + text.
 * Follows WCAG AA accessibility guidelines:
 * - Non-color-only indicators (icon + text)
 * - ARIA labels for screen readers
 * - Semantic HTML with role="status"
 * 
 * @param {boolean} isOverdue - Whether the todo is overdue
 * @param {number|null} overdueDays - Number of days overdue
 * @param {string|null} overdueDuration - Human-readable duration text
 */
function OverdueIndicator({ isOverdue, overdueDays, overdueDuration }) {
  // Don't render anything if not overdue
  if (!isOverdue) {
    return null;
  }

  // Fallback text if duration is missing
  const durationText = overdueDuration || `${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;

  return (
    <div className="overdue-indicator" role="status" aria-live="polite">
      {/* Icon provides visual cue independent of color */}
      <span className="overdue-icon" aria-hidden="true" aria-label="Warning">
        ⚠️
      </span>
      
      {/* Text provides semantic meaning */}
      <span className="overdue-text">
        {durationText} overdue
      </span>
    </div>
  );
}

export default OverdueIndicator;
