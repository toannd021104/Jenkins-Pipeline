const request = require('supertest');
const app = require('../../src/index');

describe('User Service - Integration Tests', () => {
  let createdUserId;

  describe('Complete User Lifecycle', () => {
    it('should create, read, update, and delete a user', async () => {
      // Create user
      const newUser = {
        name: 'Integration Test User',
        email: 'integration@example.com'
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data).toHaveProperty('id');
      createdUserId = createResponse.body.data.id;

      // Read user
      const readResponse = await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(200);

      expect(readResponse.body.success).toBe(true);
      expect(readResponse.body.data.name).toBe(newUser.name);
      expect(readResponse.body.data.email).toBe(newUser.email);

      // Update user
      const updateData = {
        name: 'Updated Integration User',
        email: 'updated-integration@example.com'
      };

      const updateResponse = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updateData.name);
      expect(updateResponse.body.data.email).toBe(updateData.email);

      // Verify update in list
      const listResponse = await request(app)
        .get('/api/users')
        .expect(200);

      const updatedUser = listResponse.body.data.find(u => u.id === createdUserId);
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.email).toBe(updateData.email);

      // Delete user
      await request(app)
        .delete(`/api/users/${createdUserId}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(404);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle concurrent requests properly', async () => {
      const users = [
        { name: 'Concurrent User 1', email: 'concurrent1@example.com' },
        { name: 'Concurrent User 2', email: 'concurrent2@example.com' },
        { name: 'Concurrent User 3', email: 'concurrent3@example.com' }
      ];

      // Create multiple users concurrently
      const promises = users.map(user =>
        request(app)
          .post('/api/users')
          .send(user)
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(users[index].name);
        expect(response.body.data.email).toBe(users[index].email);
      });

      // Clean up created users
      const cleanupPromises = responses.map(response =>
        request(app)
          .delete(`/api/users/${response.body.data.id}`)
      );

      await Promise.all(cleanupPromises);
    });

    it('should maintain data consistency during rapid operations', async () => {
      // Create a user
      const user = {
        name: 'Consistency Test User',
        email: 'consistency@example.com'
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(user)
        .expect(201);

      const userId = createResponse.body.data.id;

      // Perform rapid updates
      const updates = [
        { name: 'Update 1' },
        { name: 'Update 2' },
        { name: 'Update 3' }
      ];

      for (const update of updates) {
        await request(app)
          .put(`/api/users/${userId}`)
          .send(update)
          .expect(200);
      }

      // Verify final state
      const finalResponse = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(finalResponse.body.data.name).toBe('Update 3');

      // Clean up
      await request(app)
        .delete(`/api/users/${userId}`)
        .expect(204);
    });
  });

  describe('Service Health Integration', () => {
    it('should maintain health status during load', async () => {
      // Check initial health
      const initialHealth = await request(app)
        .get('/health')
        .expect(200);

      expect(initialHealth.body.status).toBe('healthy');

      // Simulate load with multiple requests
      const loadPromises = [];
      for (let i = 0; i < 10; i++) {
        loadPromises.push(request(app).get('/api/users'));
      }

      await Promise.all(loadPromises);

      // Check health after load
      const finalHealth = await request(app)
        .get('/health')
        .expect(200);

      expect(finalHealth.body.status).toBe('healthy');
      expect(finalHealth.body.service).toBe('user-service');
    });
  });
});