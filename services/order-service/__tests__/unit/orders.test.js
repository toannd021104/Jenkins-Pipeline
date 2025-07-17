const request = require('supertest');
const app = require('../../src/index');

describe('Order Service - Unit Tests', () => {
  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter orders by userId', async () => {
      const response = await request(app)
        .get('/api/orders?userId=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(order => {
        expect(order.userId).toBe('1');
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a specific order', async () => {
      const response = await request(app)
        .get('/api/orders/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', '1');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const newOrder = {
        userId: '1',
        items: [
          {
            productId: 'p3',
            name: 'Test Product',
            quantity: 2,
            price: 19.99
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.userId).toBe(newOrder.userId);
      expect(response.body.data.items).toEqual(newOrder.items);
      expect(response.body.data.total).toBe(39.98);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should return validation error for invalid data', async () => {
      const invalidOrder = {
        userId: '1',
        items: [] // Empty items array
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    it('should return validation error for missing required fields', async () => {
      const invalidOrder = {
        items: [
          {
            productId: 'p1',
            name: 'Product',
            quantity: 1,
            price: 10.00
          }
        ]
        // Missing userId
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update order status', async () => {
      const updateData = {
        status: 'processing'
      };

      const response = await request(app)
        .put('/api/orders/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return validation error for invalid status', async () => {
      const updateData = {
        status: 'invalid-status'
      };

      const response = await request(app)
        .put('/api/orders/1')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should return 404 for non-existent order', async () => {
      const updateData = {
        status: 'processing'
      };

      const response = await request(app)
        .put('/api/orders/999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should cancel an order', async () => {
      const response = await request(app)
        .delete('/api/orders/2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .delete('/api/orders/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });
  });
});