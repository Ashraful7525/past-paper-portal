import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftEllipsisIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user, logout, isLoggingOut } = useAuth();

  const stats = [
    { name: 'Total Users', value: '1,234', icon: UsersIcon, color: 'bg-blue-500', change: '+12%', period: 'vs last month' },
    { name: 'Questions', value: '856', icon: DocumentTextIcon, color: 'bg-green-500', change: '+8%', period: 'vs last month' },
    { name: 'Solutions', value: '2,341', icon: CheckCircleIcon, color: 'bg-purple-500', change: '+15%', period: 'vs last month' },
    { name: 'Pending Reviews', value: '23', icon: ExclamationTriangleIcon, color: 'bg-yellow-500', change: '-5%', period: 'vs last week' },
  ];

  const recentActivity = [
    { action: 'New user registered', user: 'john.doe@example.com', time: '5 minutes ago', type: 'user' },
    { action: 'Question flagged for review', user: 'jane.smith@example.com', time: '30 minutes ago', type: 'flag' },
    { action: 'Solution verified', user: 'admin@example.com', time: '1 hour ago', type: 'verify' },
    { action: 'User reported spam', user: 'mike.wilson@example.com', time: '2 hours ago', type: 'report' },
    { action: 'New question submitted', user: 'sarah.johnson@example.com', time: '3 hours ago', type: 'content' },
  ];

  const pendingActions = [
    { type: 'Question Review', count: 12, priority: 'high', description: 'Questions pending verification' },
    { type: 'Solution Verification', count: 8, priority: 'medium', description: 'Solutions awaiting approval' },
    { type: 'User Reports', count: 3, priority: 'high', description: 'User behavior reports' },
    { type: 'Content Moderation', count: 5, priority: 'low', description: 'Comments for review' },
  ];

  const systemHealth = [
    { metric: 'Server Uptime', value: '99.9%', status: 'excellent' },
    { metric: 'Response Time', value: '120ms', status: 'good' },
    { metric: 'Error Rate', value: '0.1%', status: 'excellent' },
    { metric: 'Active Users', value: '342', status: 'good' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return UsersIcon;
      case 'flag': return ExclamationTriangleIcon;
      case 'verify': return CheckCircleIcon;
      case 'report': return ExclamationTriangleIcon;
      case 'content': return DocumentTextIcon;
      default: return DocumentTextIcon;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Profile
              </Link>
              <div className="text-right">
                <span className="text-sm text-gray-600 dark:text-gray-300">Administrator,</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 transition-colors"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <span className={`ml-2 text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.period}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pending Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {pendingActions.map((action, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{action.type}</p>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          action.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          action.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {action.priority}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{action.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{action.count} pending</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {systemHealth.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.metric}</p>
                        <p className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value}
                        </p>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${
                        metric.status === 'excellent' ? 'bg-green-500' :
                        metric.status === 'good' ? 'bg-blue-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <UsersIcon className="h-5 w-5 mr-3" />
                    Manage Users
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <DocumentTextIcon className="h-5 w-5 mr-3" />
                    Content Moderation
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <ChartBarIcon className="h-5 w-5 mr-3" />
                    Analytics & Reports
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <Cog6ToothIcon className="h-5 w-5 mr-3" />
                    System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
