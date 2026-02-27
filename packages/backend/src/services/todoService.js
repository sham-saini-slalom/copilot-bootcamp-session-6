/**
 * Todo Service
 * Business logic for todo operations
 */

class TodoService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Get all todos ordered by creation date (newest first)
   * @returns {Array} Array of todo objects
   */
  getAllTodos() {
    try {
      return this.db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();
    } catch (error) {
      throw new Error(`Failed to fetch todos: ${error.message}`);
    }
  }

  /**
   * Get a single todo by ID
   * @param {number} id - Todo ID
   * @returns {Object|null} Todo object or null if not found
   */
  getTodoById(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      return this.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    } catch (error) {
      throw new Error(`Failed to fetch todo: ${error.message}`);
    }
  }

  /**
   * Create a new todo
   * @param {string} title - Todo title (required, max 255 chars)
   * @param {string|null} dueDate - Due date in ISO format (optional)
   * @returns {Object} Created todo object
   */
  createTodo(title, dueDate = null) {
    try {
      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new Error('Todo title is required');
      }

      if (title.length > 255) {
        throw new Error('Todo title must not exceed 255 characters');
      }

      const stmt = this.db.prepare(
        'INSERT INTO todos (title, dueDate, completed) VALUES (?, ?, ?)'
      );
      const result = stmt.run(title.trim(), dueDate || null, 0);
      const id = result.lastInsertRowid;

      return this.getTodoById(id);
    } catch (error) {
      throw new Error(`Failed to create todo: ${error.message}`);
    }
  }

  /**
   * Update a todo's title and/or due date
   * @param {number} id - Todo ID
   * @param {Object} updates - Object with title and/or dueDate
   * @returns {Object} Updated todo object
   */
  updateTodo(id, updates = {}) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      const existingTodo = this.getTodoById(id);
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      const { title, dueDate } = updates;

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          throw new Error('Todo title must be a non-empty string');
        }

        if (title.length > 255) {
          throw new Error('Todo title must not exceed 255 characters');
        }
      }

      const newTitle = title !== undefined ? title.trim() : existingTodo.title;
      const newDueDate = dueDate !== undefined ? dueDate : existingTodo.dueDate;

      const stmt = this.db.prepare('UPDATE todos SET title = ?, dueDate = ? WHERE id = ?');
      stmt.run(newTitle, newDueDate || null, id);

      return this.getTodoById(id);
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
  }

  /**
   * Toggle the completion status of a todo
   * @param {number} id - Todo ID
   * @returns {Object} Updated todo object
   */
  updateTodoStatus(id, completed) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      const existingTodo = this.getTodoById(id);
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      const stmt = this.db.prepare('UPDATE todos SET completed = ? WHERE id = ?');
      const newCompleted = typeof completed === 'boolean' ? (completed ? 1 : 0) : (existingTodo.completed ? 0 : 1);
      stmt.run(newCompleted, id);

      return this.getTodoById(id);
    } catch (error) {
      throw new Error(`Failed to update todo status: ${error.message}`);
    }
  }

  /**
   * Delete a todo by ID
   * @param {number} id - Todo ID
   * @returns {Object} Deleted todo object
   */
  deleteTodo(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      const existingTodo = this.getTodoById(id);
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes > 0) {
        return existingTodo;
      } else {
        throw new Error('Todo not found');
      }
    } catch (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }
  }
}

/**
 * Date utility functions for overdue calculation
 */

/**
 * Determines if a todo is currently overdue
 * @param {Object} todo - Todo object with dueDate and completed fields
 * @returns {boolean} - True if overdue, false otherwise
 */
function isOverdue(todo) {
  // Must have a due date to be overdue
  if (!todo.dueDate) return false;
  
  // Completed todos are never overdue
  if (todo.completed === 1 || todo.completed === true) return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Start of due date
    
    // Check if date is valid
    if (isNaN(dueDate.getTime())) {
      console.error('Invalid date format:', todo.dueDate);
      return false;
    }
    
    // Overdue if due date is before today
    return dueDate < today;
  } catch (error) {
    // If date parsing fails, treat as not overdue (error logged separately)
    console.error('Date calculation error:', error);
    return false;
  }
}

/**
 * Calculates number of days overdue
 * @param {string} dueDate - ISO 8601 date string
 * @returns {number|null} - Days overdue, or null if not overdue
 */
function getOverdueDays(dueDate) {
  if (!dueDate) return null;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    // Check if date is valid
    if (isNaN(due.getTime())) {
      console.error('Invalid date format:', dueDate);
      return null;
    }
    
    const diffMs = today - due;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Return null if not actually overdue (negative or zero)
    return diffDays > 0 ? diffDays : null;
  } catch (error) {
    console.error('Date calculation error:', error);
    return null;
  }
}

/**
 * Formats overdue days into human-readable text
 * @param {number} days - Number of days overdue
 * @returns {string} - Formatted duration text
 */
function formatOverdueDuration(days) {
  if (days >= 365) {
    return '1+ year';
  } else if (days >= 31) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (days === 1) {
    return '1 day';
  } else {
    return `${days} days`;
  }
}

/**
 * Enhances a todo object with computed overdue fields
 * @param {Object} todo - Todo object from database
 * @returns {Object} - Todo object with isOverdue, overdueDays, overdueDuration fields
 */
function enhanceTodoWithOverdueFields(todo) {
  const overdueStatus = isOverdue(todo);
  const overdueDaysCount = overdueStatus ? getOverdueDays(todo.dueDate) : null;
  
  return {
    ...todo,
    isOverdue: overdueStatus,
    overdueDays: overdueDaysCount,
    overdueDuration: overdueDaysCount ? formatOverdueDuration(overdueDaysCount) : null
  };
}

module.exports = TodoService;
module.exports.isOverdue = isOverdue;
module.exports.getOverdueDays = getOverdueDays;
module.exports.formatOverdueDuration = formatOverdueDuration;
module.exports.enhanceTodoWithOverdueFields = enhanceTodoWithOverdueFields;
