import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Users, Leaf, AlertCircle, Plus, Brain } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    cropData: [],
    pieData: [],
    activities: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
      
      console.log('🔄 Fetching dashboard data from:', `${API_BASE_URL}/stats/dashboard`);
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      
      // If no token, show demo data
      if (!token) {
        console.log('ℹ️ No auth token found, showing demo data');
        setDashboardData({
          stats: [
            {
              title: 'Active Users',
              value: '1,234',
              change: '+12%',
              icon: Users,
              color: 'green'
            },
            {
              title: 'Predictions Made',
              value: '5,678',
              change: '+25%',
              icon: Brain,
              color: 'green'
            },
            {
              title: 'Feedback Received',
              value: '890',
              change: '+8%',
              icon: TrendingUp,
              color: 'green'
            },
            {
              title: 'Disease Types',
              value: '15',
              change: '+3%',
              icon: Leaf,
              color: 'green'
            }
          ],
          cropData: [
            { name: 'Jan', healthy: 85, diseased: 15 },
            { name: 'Feb', healthy: 78, diseased: 22 },
            { name: 'Mar', healthy: 92, diseased: 8 },
            { name: 'Apr', healthy: 88, diseased: 12 },
            { name: 'May', healthy: 95, diseased: 5 },
            { name: 'Jun', healthy: 90, diseased: 10 }
          ],
          pieData: [
            { name: 'Leaf Spot', value: 35, color: '#00ff7f' },
            { name: 'Rust', value: 25, color: '#00cc7f' },
            { name: 'Blight', value: 20, color: '#009959' },
            { name: 'Powdery Mildew', value: 12, color: '#006633' },
            { name: 'Others', value: 8, color: '#004d26' }
          ],
          activities: [
            {
              title: 'Disease Detection',
              description: 'Detected: Leaf Spot in tomato crop',
              time: '2 hours ago',
              icon: Leaf
            },
            {
              title: 'Health Analysis',
              description: 'Crop health improved by 15%',
              time: '5 hours ago',
              icon: TrendingUp
            },
            {
              title: 'New Detection',
              description: 'Detected: Rust in wheat field',
              time: '1 day ago',
              icon: Brain
            }
          ],
          loading: false,
          error: null
        });
        return;
      }
      
      // Fetch dashboard stats from backend
      const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle responses
      let stats = [], cropData = [], pieData = [], activities = [];
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to frontend format
        stats = [
          {
            title: 'Active Users',
            value: data.summary?.totalUsers || 0,
            change: '+0%',
            icon: Users,
            color: 'green'
          },
          {
            title: 'Total Predictions',
            value: data.summary?.totalPredictions || 0,
            change: '+0%',
            icon: Brain,
            color: 'green'
          },
          {
            title: 'Feedback Count',
            value: data.summary?.totalFeedback || 0,
            change: '+0%',
            icon: TrendingUp,
            color: 'green'
          },
          {
            title: 'Disease Types',
            value: data.diseaseDistribution?.length || 0,
            change: '+0%',
            icon: Leaf,
            color: 'green'
          }
        ];
        
        // Transform disease distribution to pie chart data
        if (data.diseaseDistribution && data.diseaseDistribution.length > 0) {
          pieData = data.diseaseDistribution.map((item, index) => ({
            name: item._id || 'Unknown',
            value: item.count,
            color: ['#00ff7f', '#00cc7f', '#009959', '#006633', '#004d26'][index % 5]
          }));
        }
        
        // Transform recent activity
        if (data.recentActivity && data.recentActivity.length > 0) {
          activities = data.recentActivity.map(activity => ({
            title: 'Disease Detection',
            description: `Detected: ${activity.prediction?.disease || 'Unknown'}`,
            time: new Date(activity.createdAt).toLocaleDateString(),
            icon: Leaf
          }));
        }
        
        // Generate sample crop data for charts (since backend doesn't have this yet)
        cropData = [
          { name: 'Jan', healthy: 85, diseased: 15 },
          { name: 'Feb', healthy: 78, diseased: 22 },
          { name: 'Mar', healthy: 92, diseased: 8 },
          { name: 'Apr', healthy: 88, diseased: 12 },
          { name: 'May', healthy: 95, diseased: 5 },
          { name: 'Jun', healthy: 90, diseased: 10 }
        ];
      }

      setDashboardData({
        stats,
        cropData,
        pieData,
        activities,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to connect to backend. Please check your connection.'
      }));
    }
  };

  const EmptyState = ({ title, description, actionText, onAction }) => (
    <div className="empty-state">
      <div className="empty-icon">
        <AlertCircle size={48} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          <Plus size={16} />
          {actionText}
        </button>
      )}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  );

  if (dashboardData.loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Monitor your agricultural performance and insights</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Monitor your agricultural performance and insights</p>
        </div>
        <EmptyState 
          title="Error Loading Data"
          description={dashboardData.error}
          actionText="Retry"
          onAction={fetchDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Monitor your agricultural performance and insights</p>
        <button className="btn btn-outline" onClick={fetchDashboardData}>
          Refresh Data
        </button>
      </div>

      {/* Stats Section - Show empty state if no data */}
      <div className="dashboard-section">
        <h2>Quick Stats</h2>
        {dashboardData.stats.length === 0 ? (
          <EmptyState 
            title="No Statistics Available"
            description="Connect your farm data to see performance statistics here."
            actionText="Add Farm Data"
            onAction={() => console.log('Navigate to data input')}
          />
        ) : (
          <div className="stats-grid">
            {dashboardData.stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="stat-card">
                  <div className="stat-icon">
                    <Icon size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                    <span className={`change ${stat.color}`}>{stat.change}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="dashboard-section">
        <h2>Analytics & Insights</h2>
        <div className="charts-grid">
          {/* Crop Production Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Health Detection Trends</h3>
              <p>Monthly healthy vs diseased crop analysis</p>
            </div>
            {dashboardData.cropData.length === 0 ? (
              <EmptyState 
                title="No Production Data"
                description="Start tracking your crop production to see trends and analytics."
                actionText="Add Production Data"
                onAction={() => console.log('Navigate to production input')}
              />
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.cropData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,127,0.1)" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0,255,127,0.3)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="healthy" fill="#00ff7f" />
                    <Bar dataKey="diseased" fill="#ff4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Revenue Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Health Monitoring</h3>
              <p>Crop health percentage over time</p>
            </div>
            {dashboardData.cropData.length === 0 ? (
              <EmptyState 
                title="No Revenue Data"
                description="Track your sales and revenue to monitor financial performance."
                actionText="Add Revenue Data"
                onAction={() => console.log('Navigate to revenue input')}
              />
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.cropData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,127,0.1)" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0,255,127,0.3)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="healthy" 
                      stroke="#00ff7f" 
                      strokeWidth={3}
                      dot={{ fill: '#00ff7f', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Crop Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Disease Distribution</h3>
              <p>Types of diseases detected</p>
            </div>
            {dashboardData.pieData.length === 0 ? (
              <EmptyState 
                title="No Crop Data"
                description="Add information about your crops to see distribution analysis."
                actionText="Add Crop Information"
                onAction={() => console.log('Navigate to crop input')}
              />
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0,255,127,0.3)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Recent Activity</h3>
              <p>Latest farming activities</p>
            </div>
            {dashboardData.activities.length === 0 ? (
              <EmptyState 
                title="No Recent Activity"
                description="Your recent farming activities and updates will appear here."
                actionText="Record Activity"
                onAction={() => console.log('Navigate to activity input')}
              />
            ) : (
              <div className="activity-list">
                {dashboardData.activities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <activity.icon size={16} />
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
