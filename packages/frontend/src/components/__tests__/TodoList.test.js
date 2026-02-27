import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from '../TodoList';

describe('TodoList Component', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  const mockTodos = [
    {
      id: 1,
      title: 'Todo 1',
      dueDate: '2025-12-25',
      completed: 0,
      createdAt: '2025-11-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Todo 2',
      dueDate: null,
      completed: 1,
      createdAt: '2025-11-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when todos array is empty', () => {
    render(<TodoList todos={[]} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText(/No todos yet. Add one to get started!/)).toBeInTheDocument();
  });

  it('should render all todos when provided', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('should render correct number of todo cards', () => {
    const { container } = render(
      <TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />
    );
    
    const cards = container.querySelectorAll('.todo-card');
    expect(cards).toHaveLength(2);
  });

  it('should pass handlers to TodoCard components', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} isLoading={false} />);
    
    // Verify that edit buttons exist for each todo
    expect(screen.getAllByLabelText(/Edit/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Delete/)).toHaveLength(2);
  });

  // Filter and Sort Controls Tests (User Story 3)
  describe('Filter Controls', () => {
    const mockOnFilterChange = jest.fn();
    
    beforeEach(() => {
      mockOnFilterChange.mockClear();
    });

    it('should render filter dropdown', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByLabelText(/filter/i)).toBeInTheDocument();
    });

    it('should call onFilterChange when filter is changed', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const filterSelect = screen.getByLabelText(/filter/i);
      fireEvent.change(filterSelect, { target: { value: 'overdue' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith('overdue');
    });

    it('should show "Show All" and "Overdue Only" filter options', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText(/Show All/i)).toBeInTheDocument();
      expect(screen.getByText(/Overdue Only/i)).toBeInTheDocument();
    });

    it('should display selected filter value', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          filter="overdue"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const filterSelect = screen.getByLabelText(/filter/i);
      expect(filterSelect.value).toBe('overdue');
    });
  });

  describe('Sort Controls', () => {
    const mockOnSortChange = jest.fn();
    
    beforeEach(() => {
      mockOnSortChange.mockClear();
    });

    it('should render sort dropdown', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          sort="recent"
          onSortChange={mockOnSortChange}
        />
      );
      
      expect(screen.getByLabelText(/sort/i)).toBeInTheDocument();
    });

    it('should call onSortChange when sort is changed', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          sort="recent"
          onSortChange={mockOnSortChange}
        />
      );
      
      const sortSelect = screen.getByLabelText(/sort/i);
      fireEvent.change(sortSelect, { target: { value: 'overdue-desc' } });
      
      expect(mockOnSortChange).toHaveBeenCalledWith('overdue-desc');
    });

    it('should show sort options including "Most Overdue First"', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          sort="recent"
          onSortChange={mockOnSortChange}
        />
      );
      
      expect(screen.getByText(/Most Recent/i)).toBeInTheDocument();
      expect(screen.getByText(/Most Overdue First/i)).toBeInTheDocument();
    });

    it('should display selected sort value', () => {
      render(
        <TodoList 
          todos={mockTodos} 
          {...mockHandlers} 
          isLoading={false}
          sort="overdue-desc"
          onSortChange={mockOnSortChange}
        />
      );
      
      const sortSelect = screen.getByLabelText(/sort/i);
      expect(sortSelect.value).toBe('overdue-desc');
    });
  });

  describe('Empty State with Overdue Filter', () => {
    const mockOnFilterChange = jest.fn();

    it('should show "No overdue todos" message when filter=overdue and no todos', () => {
      render(
        <TodoList 
          todos={[]} 
          {...mockHandlers} 
          isLoading={false}
          filter="overdue"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText(/No overdue todos/i)).toBeInTheDocument();
    });

    it('should show default empty state when filter=all and no todos', () => {
      render(
        <TodoList 
          todos={[]} 
          {...mockHandlers} 
          isLoading={false}
          filter="all"
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText(/No todos yet. Add one to get started!/i)).toBeInTheDocument();
    });
  });
});
