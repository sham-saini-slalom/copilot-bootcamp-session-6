import { render, screen } from '@testing-library/react';
import OverdueIndicator from '../OverdueIndicator';

describe('OverdueIndicator Component', () => {
  it('should render overdue indicator with icon and text when overdue', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={7}
        overdueDuration="7 days"
      />
    );

    // Check for overdue text
    expect(screen.getByText(/7 days overdue/i)).toBeInTheDocument();
    
    // Check for aria-live region
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
  });

  it('should render single day correctly (singular)', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={1}
        overdueDuration="1 day"
      />
    );

    expect(screen.getByText(/1 day overdue/i)).toBeInTheDocument();
  });

  it('should render months correctly', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={60}
        overdueDuration="2 months"
      />
    );

    expect(screen.getByText(/2 months overdue/i)).toBeInTheDocument();
  });

  it('should render "1+ year" correctly', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={400}
        overdueDuration="1+ year"
      />
    );

    expect(screen.getByText(/1\+ year overdue/i)).toBeInTheDocument();
  });

  it('should not render anything when not overdue', () => {
    const { container } = render(
      <OverdueIndicator
        isOverdue={false}
        overdueDays={null}
        overdueDuration={null}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should not render when isOverdue is false even with overdueDays provided', () => {
    const { container } = render(
      <OverdueIndicator
        isOverdue={false}
        overdueDays={7}
        overdueDuration="7 days"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={3}
        overdueDuration="3 days"
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('should have warning icon with aria-hidden', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={5}
        overdueDuration="5 days"
      />
    );

    const icon = screen.getByLabelText('Warning');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should apply overdue-indicator class for styling', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={2}
        overdueDuration="2 days"
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('overdue-indicator');
  });

  it('should handle missing overdueDuration gracefully', () => {
    render(
      <OverdueIndicator
        isOverdue={true}
        overdueDays={7}
        overdueDuration={null}
      />
    );

    // Should still render but with fallback text
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
  });
});
