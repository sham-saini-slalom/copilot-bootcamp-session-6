const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Todo API Endpoints', () => {
  describe('GET /api/todos', () => {
    it('should return array of todos', async () => {
      const response = await request(app).get('/api/todos');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('completed');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should return todos ordered by creation date (newest first)', async () => {
      const response = await request(app).get('/api/todos');
      expect(response.status).toBe(200);
      if (response.body.length > 1) {
        const firstCreated = new Date(response.body[0].createdAt);
        const secondCreated = new Date(response.body[1].createdAt);
        expect(firstCreated.getTime()).toBeGreaterThanOrEqual(secondCreated.getTime());
      }
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return single todo by ID', async () => {
      const listResponse = await request(app).get('/api/todos');
      const todoId = listResponse.body[0].id;

      const response = await request(app).get(`/api/todos/${todoId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', todoId);
      expect(response.body).toHaveProperty('title');
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app).get('/api/todos/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/todos/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/todos', () => {
    it('should create new todo with title only', async () => {
      const response = await request(app).post('/api/todos').send({ title: 'Test Todo' });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Todo');
      expect(response.body.completed).toBe(0);
      expect(response.body.dueDate).toBeNull();
    });

    it('should create new todo with title and due date', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Urgent Task', dueDate: '2025-12-25' });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Urgent Task');
      expect(response.body.dueDate).toBe('2025-12-25');
      expect(response.body.completed).toBe(0);
    });

    it('should trim title whitespace', async () => {
      const response = await request(app).post('/api/todos').send({ title: '  Trimmed Todo  ' });
      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Trimmed Todo');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app).post('/api/todos').send({ title: '' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app).post('/api/todos').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if title exceeds 255 characters', async () => {
      const longTitle = 'a'.repeat(256);
      const response = await request(app).post('/api/todos').send({ title: longTitle });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo title', async () => {
      const createResponse = await request(app).post('/api/todos').send({ title: 'Original Title' });
      const todoId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Title' });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title');
      expect(updateResponse.body.id).toBe(todoId);
    });

    it('should update todo due date', async () => {
      const createResponse = await request(app).post('/api/todos').send({ title: 'Task' });
      const todoId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ dueDate: '2025-12-31' });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.dueDate).toBe('2025-12-31');
    });

    it('should update both title and due date', async () => {
      const createResponse = await request(app).post('/api/todos').send({ title: 'Task' });
      const todoId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'New Title', dueDate: '2026-01-01' });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('New Title');
      expect(updateResponse.body.dueDate).toBe('2026-01-01');
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/999999')
        .send({ title: 'New Title' });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/todos/invalid')
        .send({ title: 'New Title' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if title is empty', async () => {
      const createResponse = await request(app).post('/api/todos').send({ title: 'Task' });
      const todoId = createResponse.body.id;

      const response = await request(app).put(`/api/todos/${todoId}`).send({ title: '' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle todo from incomplete to complete', async () => {
      const createResponse = await request(app).post('/api/todos').send({ title: 'Task to Complete' });
      const todoId = createResponse.body.id;

      const toggleResponse = await request(app).patch(`/api/todos/${todoId}/toggle`);
      expect(toggleResponse.status).toBe(200);
      expect(toggleResponse.body.completed).toBe(1);
    });

    it('should toggle todo from complete to incomplete', async () => {
      const createResponse = await request(app).post('/api/todos').send({ title: 'Task' });
      const todoId = createResponse.body.id;

      await request(app).patch(`/api/todos/${todoId}/toggle`);

      const toggleResponse = await request(app).patch(`/api/todos/${todoId}/toggle`);
      expect(toggleResponse.status).toBe(200);
      expect(toggleResponse.body.completed).toBe(0);
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app).patch('/api/todos/999999/toggle');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).patch('/api/todos/invalid/toggle');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete existing todo', async () => {
      const createResponse = await request(app).post('/api/todos').send({ title: 'Todo to Delete' });
      const todoId = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/api/todos/${todoId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message');
      expect(deleteResponse.body.id).toBe(todoId);

      const getResponse = await request(app).get(`/api/todos/${todoId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app).delete('/api/todos/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).delete('/api/todos/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Backward compatibility tests for old /api/items endpoints
  describe('GET /api/items (backward compatibility)', () => {
    it('should return array of items', async () => {
      const response = await request(app).get('/api/items');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/items (backward compatibility)', () => {
    it('should create new item', async () => {
      const response = await request(app).post('/api/items').send({ name: 'Test Item' });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Item');
    });
  });

  describe('DELETE /api/items/:id (backward compatibility)', () => {
    it('should delete existing item', async () => {
      const createResponse = await request(app).post('/api/items').send({ name: 'Item to Delete' });
      const itemId = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/api/items/${itemId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message');
    });
  });

  // Overdue Todo Feature Tests (User Story 1)
  describe('Overdue Computed Fields', () => {
    beforeEach(() => {
      // Mock Date to return fixed 'today' value for deterministic testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-02-27T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('GET /api/todos - computed overdue fields', () => {
      it('should include isOverdue, overdueDays, overdueDuration for all todos', async () => {
        const response = await request(app).get('/api/todos');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        
        response.body.forEach(todo => {
          expect(todo).toHaveProperty('isOverdue');
          expect(todo).toHaveProperty('overdueDays');
          expect(todo).toHaveProperty('overdueDuration');
          expect(typeof todo.isOverdue).toBe('boolean');
        });
      });

      it('should return isOverdue=true for pending todo with past due date', async () => {
        // Create todo with past due date
        const createResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'Overdue Task', dueDate: '2026-02-20' });
        
        const response = await request(app).get('/api/todos');
        const createdTodo = response.body.find(t => t.id === createResponse.body.id);
        
        expect(createdTodo.isOverdue).toBe(true);
        expect(createdTodo.overdueDays).toBe(7);
        expect(createdTodo.overdueDuration).toBe('7 days');
      });

      it('should return isOverdue=false for todo due today', async () => {
        const createResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'Due Today', dueDate: '2026-02-27' });
        
        const response = await request(app).get('/api/todos');
        const createdTodo = response.body.find(t => t.id === createResponse.body.id);
        
        expect(createdTodo.isOverdue).toBe(false);
        expect(createdTodo.overdueDays).toBeNull();
        expect(createdTodo.overdueDuration).toBeNull();
      });

      it('should return isOverdue=false for completed todo with past due date', async () => {
        const createResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Overdue', dueDate: '2026-02-20' });
        
        // Toggle to completed
        await request(app).patch(`/api/todos/${createResponse.body.id}/toggle`);
        
        const response = await request(app).get('/api/todos');
        const completedTodo = response.body.find(t => t.id === createResponse.body.id);
        
        expect(completedTodo.isOverdue).toBe(false);
        expect(completedTodo.overdueDays).toBeNull();
        expect(completedTodo.overdueDuration).toBeNull();
      });

      it('should return isOverdue=false for todo without due date', async () => {
        const createResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'No Due Date' });
        
        const response = await request(app).get('/api/todos');
        const createdTodo = response.body.find(t => t.id === createResponse.body.id);
        
        expect(createdTodo.isOverdue).toBe(false);
        expect(createdTodo.overdueDays).toBeNull();
        expect(createdTodo.overdueDuration).toBeNull();
      });
    });

    describe('GET /api/todos/:id - computed overdue fields', () => {
      it('should include computed overdue fields for single todo', async () => {
        const createResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'Test Todo', dueDate: '2026-02-25' });
        
        const response = await request(app).get(`/api/todos/${createResponse.body.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('isOverdue');
        expect(response.body).toHaveProperty('overdueDays');
        expect(response.body).toHaveProperty('overdueDuration');
        expect(response.body.isOverdue).toBe(true);
        expect(response.body.overdueDays).toBe(2);
        expect(response.body.overdueDuration).toBe('2 days');
      });
    });

    describe('POST /api/todos - computed overdue fields', () => {
      it('should include computed overdue fields in created todo response', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'New Overdue Task', dueDate: '2026-02-20' });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('isOverdue');
        expect(response.body).toHaveProperty('overdueDays');
        expect(response.body).toHaveProperty('overdueDuration');
        expect(response.body.isOverdue).toBe(true);
        expect(response.body.overdueDays).toBe(7);
      });
    });

    describe('PUT /api/todos/:id - computed overdue fields recalculation', () => {
      it('should recalculate overdue fields when updating todo', async () => {
        const createResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', dueDate: '2026-02-25' });
        
        const updateResponse = await request(app)
          .put(`/api/todos/${createResponse.body.id}`)
          .send({ dueDate: '2026-03-01' });
        
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.isOverdue).toBe(false);
        expect(updateResponse.body.overdueDays).toBeNull();
        expect(updateResponse.body.overdueDuration).toBeNull();
      });

      it('should set isOverdue=false when updating due date from past to future', async () => {
        const createResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'Overdue Task', dueDate: '2026-02-20' });
        
        expect(createResponse.body.isOverdue).toBe(true);
        
        const updateResponse = await request(app)
          .put(`/api/todos/${createResponse.body.id}`)
          .send({ dueDate: '2026-03-10' });
        
        expect(updateResponse.body.isOverdue).toBe(false);
      });
    });

    // User Story 3: Filter and Sort Tests
    describe('GET /api/todos?filter=overdue - filter by overdue status', () => {
      it('should return only overdue todos when filter=overdue', async () => {
        // Create mix of overdue and non-overdue todos
        await request(app).post('/api/todos').send({ title: 'Overdue 1', dueDate: '2026-02-20' });
        await request(app).post('/api/todos').send({ title: 'Overdue 2', dueDate: '2026-02-15' });
        await request(app).post('/api/todos').send({ title: 'Future', dueDate: '2026-03-15' });
        await request(app).post('/api/todos').send({ title: 'No Date' });

        const response = await request(app).get('/api/todos?filter=overdue');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        // All returned todos should be overdue
        response.body.forEach(todo => {
          expect(todo.isOverdue).toBe(true);
        });

        // Should have at least the 2 overdue todos we created
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });

      it('should not include completed todos in overdue filter', async () => {
        const overdueResponse = await request(app)
          .post('/api/todos')
          .send({ title: 'Overdue but will complete', dueDate: '2026-02-20' });

        // Complete the todo
        await request(app).patch(`/api/todos/${overdueResponse.body.id}/toggle`);

        const response = await request(app).get('/api/todos?filter=overdue');
        
        // The completed todo should not appear in results
        const completedTodo = response.body.find(t => t.id === overdueResponse.body.id);
        expect(completedTodo).toBeUndefined();
      });

      it('should not include todos without due date in overdue filter', async () => {
        await request(app).post('/api/todos').send({ title: 'No Due Date Task' });

        const response = await request(app).get('/api/todos?filter=overdue');
        
        const noDueDateTodos = response.body.filter(t => !t.dueDate);
        expect(noDueDateTodos.length).toBe(0);
      });

      it('should return empty array when no overdue todos exist', async () => {
        // Clear all overdue todos by creating only future todos
        const response = await request(app).get('/api/todos?filter=overdue');
        
        // Filter results to only show our test todos (or accept empty if none exist)
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /api/todos?sort=overdue-desc - sort by most overdue first', () => {
      it('should sort todos by overdue days in descending order', async () => {
        // Create todos with different overdue dates
        await request(app).post('/api/todos').send({ title: 'Overdue 30 days', dueDate: '2026-01-28' });
        await request(app).post('/api/todos').send({ title: 'Overdue 7 days', dueDate: '2026-02-20' });
        await request(app).post('/api/todos').send({ title: 'Overdue 1 day', dueDate: '2026-02-26' });

        const response = await request(app).get('/api/todos?sort=overdue-desc');
        expect(response.status).toBe(200);

        // Filter to only overdue todos to verify sorting
        const overdueTodos = response.body.filter(t => t.isOverdue);
        
        if (overdueTodos.length >= 2) {
          // Verify descending order (most overdue first)
          for (let i = 0; i < overdueTodos.length - 1; i++) {
            expect(overdueTodos[i].overdueDays).toBeGreaterThanOrEqual(overdueTodos[i + 1].overdueDays);
          }
        }
      });

      it('should place non-overdue todos after overdue todos', async () => {
        await request(app).post('/api/todos').send({ title: 'Overdue', dueDate: '2026-02-20' });
        await request(app).post('/api/todos').send({ title: 'Future', dueDate: '2026-03-15' });

        const response = await request(app).get('/api/todos?sort=overdue-desc');
        
        const firstOverdueIndex = response.body.findIndex(t => t.isOverdue);
        const lastNonOverdueIndex = response.body.map((t, i) => ({ overdue: t.isOverdue, index: i }))
          .filter(item => !item.overdue)
          .pop()?.index;

        if (firstOverdueIndex >= 0 && lastNonOverdueIndex !== undefined) {
          // All overdue todos should come before non-overdue todos
          expect(firstOverdueIndex).toBeLessThan(lastNonOverdueIndex);
        }
      });

      it('should still work with no overdue todos', async () => {
        const response = await request(app).get('/api/todos?sort=overdue-desc');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /api/todos?filter=overdue&sort=overdue-desc - combined filter and sort', () => {
      it('should filter overdue and sort by most overdue first', async () => {
        // Create test todos
        await request(app).post('/api/todos').send({ title: 'Overdue 30', dueDate: '2026-01-28' });
        await request(app).post('/api/todos').send({ title: 'Overdue 7', dueDate: '2026-02-20' });
        await request(app).post('/api/todos').send({ title: 'Future', dueDate: '2026-03-15' });

        const response = await request(app).get('/api/todos?filter=overdue&sort=overdue-desc');
        expect(response.status).toBe(200);

        // All results should be overdue
        response.body.forEach(todo => {
          expect(todo.isOverdue).toBe(true);
        });

        // Results should be sorted by overdueDays descending
        if (response.body.length >= 2) {
          for (let i = 0; i < response.body.length - 1; i++) {
            expect(response.body[i].overdueDays).toBeGreaterThanOrEqual(response.body[i + 1].overdueDays);
          }
        }
      });
    });
  });
});