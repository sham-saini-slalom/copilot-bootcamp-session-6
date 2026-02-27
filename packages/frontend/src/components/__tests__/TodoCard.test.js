import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  // Overdue Indicator Integration Tests
  describe('Overdue Indicator Integration', () => {
    it('should render overdue indicator when todo is overdue', () => {
      const overdueTodo = {
        ...mockTodo,
        isOverdue: true,
        overdueDays: 7,
        overdueDuration: '7 days'
      };
      
      render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      expect(screen.getByText(/7 days overdue/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not render overdue indicator when todo is not overdue', () => {
      const notOverdueTodo = {
        ...mockTodo,
        isOverdue: false,
        overdueDays: null,
        overdueDuration: null
      };
      
      render(<TodoCard todo={notOverdueTodo} {...mockHandlers} isLoading={false} />);
      
      expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should not render overdue indicator for completed todo (even if past due)', () => {
      const completedOverdueTodo = {
        ...mockTodo,
        completed: 1,
        isOverdue: false,
        overdueDays: null,
        overdueDuration: null
      };
      
      render(<TodoCard todo={completedOverdueTodo} {...mockHandlers} isLoading={false} />);
      
      expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
    });

    it('should render overdue indicator with months when overdue for long time', () => {
      const longOverdueTodo = {
        ...mockTodo,
        isOverdue: true,
        overdueDays: 60,
        overdueDuration: '2 months'
      };
      
      render(<TodoCard todo={longOverdueTodo} {...mockHandlers} isLoading={false} />);
      
      expect(screen.getByText(/2 months overdue/i)).toBeInTheDocument();
    });

    it('should handle todo without overdue fields (backward compatibility)', () => {
      const todoWithoutOverdueFields = {
        ...mockTodo
        // No isOverdue, overdueDays, or overdueDuration fields
      };
      
      // Should not crash, just not render indicator
      render(<TodoCard todo={todoWithoutOverdueFields} {...mockHandlers} isLoading={false} />);
      
      expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
    });
  });
});
