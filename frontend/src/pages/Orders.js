import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { orderService, userService } from '../services/api';
import { Trash2, Edit, Plus, X, ShoppingCart } from 'lucide-react';

// Test webhook trigger - Updated on August 31, 2025
const Orders = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterUserId, setFilterUserId] = useState('');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      items: [{ productId: '', name: '', quantity: 1, price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Fetch orders
  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', filterUserId],
    () => orderService.getOrders(filterUserId || null),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch users for dropdown
  const { data: usersData } = useQuery('users', userService.getUsers);

  // Create order mutation
  const createOrderMutation = useMutation(orderService.createOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      toast.success('Order created successfully!');
      setShowModal(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.error || 'Failed to create order');
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation(
    ({ id, status }) => orderService.updateOrderStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        toast.success('Order status updated successfully!');
      },
      onError: (error) => {
        toast.error(error.error || 'Failed to update order');
      },
    }
  );

  // Cancel order mutation
  const cancelOrderMutation = useMutation(orderService.cancelOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      toast.success('Order cancelled successfully!');
    },
    onError: (error) => {
      toast.error(error.error || 'Failed to cancel order');
    },
  });

  const onSubmit = (data) => {
    createOrderMutation.mutate(data);
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    reset({
      items: [{ productId: '', name: '', quantity: 1, price: 0 }]
    });
  };

  if (isLoading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error loading orders: {error.error || error.message}
      </div>
    );
  }

  const orders = ordersData?.data || [];
  const users = usersData?.data || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Orders Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Create Order
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>Filter by User:</label>
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {filterUserId && (
            <button
              className="btn btn-secondary"
              onClick={() => setFilterUserId('')}
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>
          All Orders ({orders.length})
          {filterUserId && (
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
              {' '}for {users.find(u => u.id === filterUserId)?.name}
            </span>
          )}
        </h2>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            {filterUserId ? 'No orders found for this user.' : 'No orders found. Create your first order!'}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const user = users.find(u => u.id === order.userId);
                return (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{user ? user.name : `User ${order.userId}`}</td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>
                        {order.items.map((item, index) => (
                          <div key={index}>
                            {item.name} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        {order.status === 'pending' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="form-input"
                            style={{ width: 'auto', fontSize: '0.8rem', padding: '0.25rem' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                        {order.status === 'processing' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="form-input"
                            style={{ width: 'auto', fontSize: '0.8rem', padding: '0.25rem' }}
                          >
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleCancelOrder(order.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
                Create New Order
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">User</label>
                <select
                  className="form-input"
                  {...register('userId', { required: 'User is required' })}
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.userId && (
                  <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {errors.userId.message}
                  </div>
                )}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label className="form-label">Order Items</label>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => append({ productId: '', name: '', quantity: 1, price: 0 })}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    Add Item
                  </button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4>Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => remove(index)}
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label className="form-label">Product ID</label>
                        <input
                          type="text"
                          className="form-input"
                          {...register(`items.${index}.productId`, { required: 'Product ID is required' })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-input"
                          {...register(`items.${index}.name`, { required: 'Product name is required' })}
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          {...register(`items.${index}.quantity`, { 
                            required: 'Quantity is required',
                            min: { value: 1, message: 'Quantity must be at least 1' }
                          })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-input"
                          {...register(`items.${index}.price`, { 
                            required: 'Price is required',
                            min: { value: 0.01, message: 'Price must be greater than 0' }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createOrderMutation.isLoading}
                >
                  {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;