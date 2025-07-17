import React from 'react';
import { useQuery } from 'react-query';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery(
    'dashboard-stats',
    dashboardService.getStats,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error loading dashboard: {error.error || error.message}
      </div>
    );
  }

  const { users, orders, health } = stats || {};

  // Calculate order statistics
  const orderStats = orders?.data?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    acc.totalRevenue += order.total || 0;
    return acc;
  }, { pending: 0, processing: 0, completed: 0, cancelled: 0, totalRevenue: 0 }) || {};

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      {/* Service Health Status */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Service Health</h2>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: health?.userService ? '#28a745' : '#dc3545' 
              }}
            />
            <span>User Service: {health?.userService ? 'Healthy' : 'Unhealthy'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: health?.orderService ? '#28a745' : '#dc3545' 
              }}
            />
            <span>Order Service: {health?.orderService ? 'Healthy' : 'Unhealthy'}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="stats-card">
          <div className="stats-number">{users?.total || 0}</div>
          <div className="stats-label">Total Users</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-number">{orders?.total || 0}</div>
          <div className="stats-label">Total Orders</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-number">${(orderStats.totalRevenue || 0).toFixed(2)}</div>
          <div className="stats-label">Total Revenue</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-number">{orderStats.completed || 0}</div>
          <div className="stats-label">Completed Orders</div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Order Status Breakdown</h2>
        <div className="grid">
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#856404' }}>
              {orderStats.pending || 0}
            </div>
            <div>Pending</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#004085' }}>
              {orderStats.processing || 0}
            </div>
            <div>Processing</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#155724' }}>
              {orderStats.completed || 0}
            </div>
            <div>Completed</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#721c24' }}>
              {orderStats.cancelled || 0}
            </div>
            <div>Cancelled</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Users</h3>
          {users?.data?.slice(0, 5).map(user => (
            <div key={user.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: '500' }}>{user.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</div>
            </div>
          ))}
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
          {orders?.data?.slice(0, 5).map(order => (
            <div key={order.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>Order #{order.id.slice(0, 8)}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>${order.total}</div>
                </div>
                <span className={`status-badge status-${order.status}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;