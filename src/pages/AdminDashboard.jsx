import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/orders?limit=5'),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const lastSync = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const lastSyncDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const orderStatusColor = (s) => {
    if (!s) return 'bg-gray-100 text-gray-600';
    const v = s.toLowerCase();
    if (v === 'completed') return 'bg-green-100 text-green-700';
    if (v === 'printing') return 'bg-blue-100 text-blue-700';
    if (v === 'prep') return 'bg-yellow-100 text-yellow-700';
    if (v === 'pending') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-600';
  };

  const progressWidth = (status) => {
    if (!status) return '20%';
    const v = status.toLowerCase();
    if (v === 'completed') return '100%';
    if (v === 'printing') return '60%';
    if (v === 'prep') return '40%';
    return '20%';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Real-time production details</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Last Sync</p>
            <p className="text-sm text-gray-600 font-semibold">{lastSyncDate}, {lastSync}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Revenue</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">+4.5%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Backlog Jobs</p>
                  <span className="text-base">⏱</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Avg Turnaround</p>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-semibold">47H</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  48 <span className="text-sm font-normal text-gray-400">HRS</span>
                </p>
              </div>
            </div>

            {/* Active Job Queue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Active Job Queue</h2>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-10">No active jobs</p>
                ) : (
                  recentOrders.map((order, i) => (
                    <div key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="text-xs text-gray-400 w-6 shrink-0">{i + 1} —</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {order.customerName ? `${order.customerName}'s Order` : 'Bulk Order'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {order.id.substring(0, 8)} · ₱{order.totalPrice}
                        </p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 shrink-0">
                        <div
                          className="bg-gray-700 h-1.5 rounded-full transition-all"
                          style={{ width: progressWidth(order.status) }}
                        />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase shrink-0 ${orderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}