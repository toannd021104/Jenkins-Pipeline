const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const router = express.Router();

// In-memory storage for demo purposes
let orders = [
  {
    id: '1',
    userId: '1',
    items: [
      { productId: 'p1', name: 'Product 1', quantity: 2, price: 29.99 }
    ],
    total: 59.98,
    status: 'completed',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '2',
    items: [
      { productId: 'p2', name: 'Product 2', quantity: 1, price: 49.99 }
    ],
    total: 49.99,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// Validation schemas
const createOrderSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })
  ).min(1).required()
});

const updateOrderSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled')
});

// Helper function to validate user exists
async function validateUser(userId) {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.get(`${userServiceUrl}/api/users/${userId}`);
    return response.data.success;
  } catch (error) {
    console.error('Error validating user:', error.message);
    return false;
  }
}

// GET /api/orders - Get all orders
router.get('/', (req, res) => {
  const { userId } = req.query;
  
  let filteredOrders = orders;
  if (userId) {
    filteredOrders = orders.filter(order => order.userId === userId);
  }
  
  res.json({
    success: true,
    data: filteredOrders,
    count: filteredOrders.length
  });
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  res.json({
    success: true,
    data: order
  });
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }
  
  // Validate user exists (in a real system, this would be more robust)
  const userExists = await validateUser(value.userId);
  if (!userExists) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID'
    });
  }
  
  // Calculate total
  const total = value.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  const newOrder = {
    id: uuidv4(),
    ...value,
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  res.status(201).json({
    success: true,
    data: newOrder
  });
});

// PUT /api/orders/:id - Update order status
router.put('/:id', (req, res) => {
  const { error, value } = updateOrderSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }
  
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  orders[orderIndex] = {
    ...orders[orderIndex],
    ...value,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: orders[orderIndex]
  });
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', (req, res) => {
  const orderIndex = orders.findIndex(o => o.id === req.params.id);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  // Instead of deleting, mark as cancelled
  orders[orderIndex] = {
    ...orders[orderIndex],
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: orders[orderIndex]
  });
});

module.exports = router;