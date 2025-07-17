const request = require('supertest');
const app = require('../../src/index');

describe('Order Service - Integration Tests', () => {
  let createdOrderId;

  describe('Complete Order Lifecycle', () => {
    it('should create, read, update, and cancel an order', async () => {
      // Create order
      const newOrder = {
        userId: '1',
        items: [
          {
            productId: 'integration-p1',
            name: 'Integration Test Product',
            quantity: 2,
            price: 25.50
          },
          {
            productId: 'integration-p2',
            name: 'Another Test Product',
            quantity: 1,
            price: 15.99
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data).toHaveProperty('id');
      expect(createResponse.body.data.total).toBe(66.99); // (25.50 * 2) + 15.99
      expect(createResponse.body.data.status).toBe('pending');
      createdOrderId = createResponse.body.data.id;

      // Read order
      const readResponse = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .expect(200);

      expect(readResponse.body.success).toBe(true);
      expect(readResponse.body.data.userId).toBe(newOrder.userId);
      expect(readResponse.body.data.items).toEqual(newOrder.items);

      // Update order status
      const statusUpdates = ['processing', 'completed'];
      
      for (const status of statusUpdates) {
        const updateResponse = await request(app)
          .put(`/api/orders/${createdOrderId}`)
          .send({ status })
          .expect(200);

        expect(updateResponse.body.success).toBe(true);
        expect(updateResponse.body.data.status).toBe(status);
        expect(updateResponse.body.data).toHaveProperty('updatedAt');
      }

      // Cancel order (soft delete)
      const cancelResponse = await request(app)
        .delete(`/api/orders/${createdOrderId}`)
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.data.status).toBe('cancelled');

      // Verify order still exists but is cancelled
      const verifyResponse = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .expect(200);

      expect(verifyResponse.body.data.status).toBe('cancelled');
    });
  });

  describe('Order Filtering and Querying', () => {
    it('should filter orders by userId correctly', async () => {
      // Create orders for different users
      const orders = [
        {
          userId: 'test-user-1',
          items: [{ productId: 'p1', name: 'Product 1', quantity: 1, price: 10.00 }]
        },
        {
          userId: 'test-user-2',
          items: [{ productId: 'p2', name: 'Product 2', quantity: 1, price: 20.00 }]
        },
        {
          userId: 'test-user-1',
          items: [{ productId: 'p3', name: 'Product 3', quantity: 1, price: 30.00 }]
        }
      ];

      const createdOrders = [];
      for (const order of orders) {
        const response = await request(app)
          .post('/api/orders')
          .send(order)
          .expect(201);
        createdOrders.push(response.body.data);
      }

      // Filter by user 1
      const user1Orders = await request(app)
        .get('/api/orders?userId=test-user-1')
        .expect(200);

      expect(user1Orders.body.success).toBe(true);
      expect(user1Orders.body.data.length).toBeGreaterThanOrEqual(2);
      user1Orders.body.data.forEach(order => {
        expect(order.userId).toBe('test-user-1');
      });

      // Filter by user 2
      const user2Orders = await request(app)
        .get('/api/orders?userId=test-user-2')
        .expect(200);

      expect(user2Orders.body.success).toBe(true);
      expect(user2Orders.body.data.length).toBeGreaterThanOrEqual(1);
      user2Orders.body.data.forEach(order => {
        expect(order.userId).toBe('test-user-2');
      });

      // Clean up created orders
      for (const order of createdOrders) {
        await request(app)
          .delete(`/api/orders/${order.id}`)
          .expect(200);
      }
    });
  });

  describe('Order Calculation Integration', () => {
    it('should calculate totals correctly for complex orders', async () => {
      const complexOrder = {
        userId: '1',
        items: [
          { productId: 'p1', name: 'Product 1', quantity: 3, price: 12.99 },
          { productId: 'p2', name: 'Product 2', quantity: 2, price: 25.50 },
          { productId: 'p3', name: 'Product 3', quantity: 1, price: 99.99 }
        ]
      };

      const expectedTotal = (3 * 12.99) + (2 * 25.50) + (1 * 99.99); // 189.96

      const response = await request(app)
        .post('/api/orders')
        .send(complexOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(expectedTotal);

      // Clean up
      await request(app)
        .delete(`/api/orders/${response.body.data.id}`)
        .expect(200);
    });

    it('should handle decimal precision correctly', async () => {
      const precisionOrder = {
        userId: '1',
        items: [
          { productId: 'p1', name: 'Product 1', quantity: 3, price: 10.33 },
          { productId: 'p2', name: 'Product 2', quantity: 2, price: 15.67 }
        ]
      };

      const expectedTotal = Math.round(((3 * 10.33) + (2 * 15.67)) * 100) / 100; // 62.33

      const response = await request(app)
        .post('/api/orders')
        .send(precisionOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(expectedTotal);

      // Clean up
      await request(app)
        .delete(`/api/orders/${response.body.data.id}`)
        .expect(200);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle concurrent order creation properly', async () => {
      const orders = Array.from({ length: 5 }, (_, i) => ({
        userId: `concurrent-user-${i}`,
        items: [
          {
            productId: `concurrent-p${i}`,
            name: `Concurrent Product ${i}`,
            quantity: 1,
            price: 10.00 + i
          }
        ]
      }));

      // Create orders concurrently
      const promises = orders.map(order =>
        request(app)
          .post('/api/orders')
          .send(order)
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.userId).toBe(orders[index].userId);
      });

      // Clean up
      const cleanupPromises = responses.map(response =>
        request(app)
          .delete(`/api/orders/${response.body.data.id}`)
      );

      await Promise.all(cleanupPromises);
    });
  });

  describe('Service Health Integration', () => {
    it('should maintain health status during order processing load', async () => {
      // Check initial health
      const initialHealth = await request(app)
        .get('/health')
        .expect(200);

      expect(initialHealth.body.status).toBe('healthy');

      // Simulate load with multiple order operations
      const loadPromises = [];
      for (let i = 0; i < 10; i++) {
        loadPromises.push(request(app).get('/api/orders'));
      }

      await Promise.all(loadPromises);

      // Check health after load
      const finalHealth = await request(app)
        .get('/health')
        .expect(200);

      expect(finalHealth.body.status).toBe('healthy');
      expect(finalHealth.body.service).toBe('order-service');
    });
  });
});