import React from 'react';
import TodoCard from './TodoCard';
import './TodoList.css';

function TodoList({ 
  todos, 
  onToggle, 
  onEdit, 
  onDelete, 
  isLoading,
  filter = 'all',
  sort = 'recent',
  onFilterChange,
  onSortChange 
}) {
  // Handle filter change
  const handleFilterChange = (e) => {
    if (onFilterChange) {
      onFilterChange(e.target.value);
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    if (onSortChange) {
      onSortChange(e.target.value);
    }
  };

  // Determine empty state message based on filter
  const getEmptyStateMessage = () => {
    if (filter === 'overdue') {
      return 'No overdue todos! 🎉';
    }
    return 'No todos yet. Add one to get started! 👻';
  };

  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          {getEmptyStateMessage()}
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {/* Filter and Sort Controls */}
      {(onFilterChange || onSortChange) && (
        <div className="todo-list-controls">
          {onFilterChange && (
            <div className="control-group">
              <label htmlFor="todo-filter">Filter:</label>
              <select 
                id="todo-filter"
                value={filter} 
                onChange={handleFilterChange}
                className="todo-filter-select"
                aria-label="Filter todos"
              >
                <option value="all">Show All</option>
                <option value="overdue">Overdue Only</option>
              </select>
            </div>
          )}
          
          {onSortChange && (
            <div className="control-group">
              <label htmlFor="todo-sort">Sort:</label>
              <select 
                id="todo-sort"
                value={sort} 
                onChange={handleSortChange}
                className="todo-sort-select"
                aria-label="Sort todos"
              >
                <option value="recent">Most Recent</option>
                <option value="overdue-desc">Most Overdue First</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Todo Cards */}
      <div className="todo-list-items">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

export default TodoList;
