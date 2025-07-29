import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
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
  ClockIcon,
  TrashIcon,
  EyeSlashIcon,
  FlagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [moderationData, setModerationData] = useState({
    questions: [],
    reports: [],
    loading: false
  });

  const [dashboardStats, setDashboardStats] = useState({
    stats: [],
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);

  // Fetch moderation data
  const fetchModerationData = async () => {
    setModerationData(prev => ({ ...prev, loading: true }));
    try {
      const [questionsRes, reportsRes] = await Promise.all([
        api.get('/admin/questions?status=pending'),
        api.get('/admin/reports?status=pending')
      ]);
      
      setModerationData({
        questions: questionsRes.data || [],
        reports: reportsRes.data || [],
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
      setModerationData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    console.log('🔍 Frontend: Starting fetchDashboardStats');
    setDashboardStats(prev => ({ ...prev, loading: true }));
    try {
      console.log('📡 Frontend: Making API call to /admin/dashboard/stats');
      const response = await api.get('/admin/dashboard/stats');
      console.log('✅ Frontend: API response received:', response.data);
      setDashboardStats({
        stats: response.data || [],
        loading: false
      });
    } catch (error) {
      console.error('❌ Frontend: Failed to fetch dashboard stats:', error);
      console.error('❌ Frontend: Error details:', error.response?.data);
      setDashboardStats(prev => ({ ...prev, loading: false }));
    }
  };

    // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/admin/dashboard/activity');
      setRecentActivity(response.data || []);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      setRecentActivity([]);
    }
  };

  // Fetch pending actions
  const fetchPendingActions = async () => {
    try {
      const response = await api.get('/admin/dashboard/pending-actions');
      setPendingActions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch pending actions:', error);
      setPendingActions([]);
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      const response = await api.get('/admin/dashboard/system-health');
      setSystemHealth(response.data || {});
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      setSystemHealth({});
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardStats();
      fetchRecentActivity();
      fetchPendingActions();
      fetchSystemHealth();
    } else {
      fetchModerationData();
    }
  }, [activeTab]);

  // Delete functions
  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/questions/${questionId}`);
      toast.success('Question deleted successfully');
      fetchModerationData();
      fetchDashboardStats();
      fetchRecentActivity();
      fetchPendingActions();
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Delete question error:', error);
    }
  };

  // Approve functions
  const approveQuestion = async (questionId) => {
    try {
      await api.put(`/admin/questions/${questionId}/approve`);
      toast.success('Question approved successfully');
      fetchModerationData();
      fetchDashboardStats();
      fetchRecentActivity();
      fetchPendingActions();
    } catch (error) {
      toast.error('Failed to approve question');
      console.error('Approve question error:', error);
    }
  };

  // Report management functions
  const resolveReport = async (reportId) => {
    try {
      await api.put(`/admin/reports/${reportId}`, { 
        status: 'resolved',
        adminNotes: 'Report reviewed and resolved by admin'
      });
      toast.success('Report resolved successfully');
      fetchModerationData();
      fetchDashboardStats();
      fetchRecentActivity();
      fetchPendingActions();
    } catch (error) {
      toast.error('Failed to resolve report');
      console.error('Resolve report error:', error);
    }
  };

  const dismissReport = async (reportId) => {
    try {
      await api.put(`/admin/reports/${reportId}`, { 
        status: 'dismissed',
        adminNotes: 'Report reviewed and dismissed by admin'
      });
      toast.success('Report dismissed successfully');
      fetchModerationData();
      fetchDashboardStats();
      fetchRecentActivity();
      fetchPendingActions();
    } catch (error) {
      toast.error('Failed to dismiss report');
      console.error('Dismiss report error:', error);
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/reports/${reportId}`);
      toast.success('Report deleted successfully');
      fetchModerationData();
      fetchDashboardStats();
      fetchRecentActivity();
      fetchPendingActions();
    } catch (error) {
      toast.error('Failed to delete report');
      console.error('Delete report error:', error);
    }
  };

  // Navigation function
  const navigateToPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Navigation function for reported content
  const navigateToReportedContent = async (report) => {
    console.log('Navigating to reported content:', report);
    try {
      if (report.post_id) {
        // Navigate to the post page containing the reported content
        switch (report.content_type) {
          case 'post':
            navigate(`/post/${report.post_id}`);
            break;
          case 'solution':
            // Navigate to post and scroll to specific solution
            navigate(`/post/${report.post_id}?highlight=solution&id=${report.content_id}`);
            break;
          case 'comment':
            // Navigate to post and scroll to specific comment
            navigate(`/post/${report.post_id}?highlight=comment&id=${report.content_id}`);
            break;
          default:
            navigate(`/post/${report.post_id}`);
        }
      } else {
        // Fallback for content types without post_id
        switch (report.content_type) {
          case 'post':
            // First check if the post exists before navigating
            console.log(`Checking if post ${report.content_id} exists...`);
            try {
              await api.get(`/posts/${report.content_id}`);
              console.log(`Post ${report.content_id} exists, navigating...`);
              navigate(`/post/${report.content_id}`);
            } catch (error) {
              console.error(`Error accessing post ${report.content_id}:`, error);
              if (error.response?.status === 404) {
                toast.error(`Post #${report.content_id} no longer exists. This report may be outdated.`);
              } else {
                toast.error('Error accessing the reported post');
              }
            }
            break;
          default:
            toast.error('Cannot navigate to this content - post not found');
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to reported content');
    }
  };

  // Dynamic stats array based on fetched data
  const stats = dashboardStats.stats || [];

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

  const getStatIcon = (iconName) => {
    switch (iconName) {
      case 'users': return UsersIcon;
      case 'document-text': return DocumentTextIcon;
      case 'flag': return FlagIcon;
      case 'user-group': return EyeIcon;
      default: return DocumentTextIcon;
    }
  };

  const getStatColor = (iconName) => {
    switch (iconName) {
      case 'users': return 'bg-blue-500';
      case 'document-text': return 'bg-green-500';
      case 'flag': return 'bg-red-500';
      case 'user-group': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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
              <div className="text-right">
                <span className="text-sm text-gray-600 dark:text-gray-300">Administrator,</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'questions', name: 'Questions', icon: DocumentTextIcon },
                { id: 'reports', name: 'Reports', icon: FlagIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.loading ? (
                // Loading placeholders
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
                    <div className="animate-pulse">
                      <div className="flex items-center">
                        <div className="bg-gray-300 dark:bg-gray-600 rounded-md p-3 w-12 h-12"></div>
                        <div className="ml-4 flex-1">
                          <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-24 mb-2"></div>
                          <div className="bg-gray-300 dark:bg-gray-600 h-8 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                stats.map((stat) => {
                  const Icon = getStatIcon(stat.icon);
                  const colorClass = getStatColor(stat.icon);
                  return (
                    <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className={`${colorClass} rounded-md p-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value?.toLocaleString() || '0'}</p>
                            <span className={`ml-2 text-sm font-medium ${
                              stat.trend > 0 ? 'text-green-600 dark:text-green-400' : 
                              stat.trend < 0 ? 'text-red-600 dark:text-red-400' : 
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              {stat.trend > 0 ? '+' : ''}{stat.trend}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">vs last month</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
                      {recentActivity.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                        </div>
                      ) : (
                        recentActivity.map((activity, index) => {
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
                        })
                      )}
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
                      {pendingActions.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No pending actions</p>
                        </div>
                      ) : (
                        pendingActions.map((action, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {action.type === 'question' ? 'Question Review' : 'Report Review'}
                              </p>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                action.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                action.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              }`}>
                                {action.priority}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{action.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(action.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
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
                      {!systemHealth || Object.keys(systemHealth).length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">System health data loading...</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">System Status</p>
                              <p className={`text-lg font-bold ${getStatusColor(systemHealth.status)}`}>
                                {systemHealth.status?.charAt(0).toUpperCase() + systemHealth.status?.slice(1)}
                              </p>
                            </div>
                            <div className={`h-3 w-3 rounded-full ${
                              systemHealth.status === 'excellent' ? 'bg-green-500' :
                              systemHealth.status === 'good' ? 'bg-blue-500' :
                              systemHealth.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Posts Today</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{systemHealth.postsToday || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">New Users Today</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{systemHealth.newUsersToday || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Reports</p>
                              <p className={`text-lg font-bold ${
                                systemHealth.pendingReports > 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                              }`}>
                                {systemHealth.pendingReports || 0}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <button 
                        onClick={() => setActiveTab('questions')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-3" />
                        Moderate Questions
                      </button>
                      <button 
                        onClick={() => setActiveTab('reports')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FlagIcon className="h-5 w-5 mr-3" />
                        Moderate Reports
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
          </>
        )}

        {/* Questions Moderation Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Questions Pending Moderation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and moderate submitted questions</p>
              </div>
              <div className="p-6">
                {moderationData.loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : moderationData.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending questions</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All questions have been reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderationData.questions.map((question) => (
                      <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 
                                className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
                                onClick={() => navigateToPost(question.id)}
                                title="Click to view full post"
                              >
                                {question.title}
                              </h4>
                              <button
                                onClick={() => navigateToPost(question.id)}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="View post"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{question.content}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>By: {question.author}</span>
                              <span>•</span>
                              <span>{question.course}</span>
                              <span>•</span>
                              <span>{question.department}</span>
                              <span>•</span>
                              <span>{question.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => navigateToPost(question.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="View full post"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Post
                            </button>
                            <button
                              onClick={() => approveQuestion(question.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => deleteQuestion(question.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Moderation Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and moderate user-reported content</p>
              </div>
              <div className="p-6">
                {moderationData.loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : moderationData.reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FlagIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending reports</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All reports have been reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderationData.reports.map((report) => (
                      <div key={report.report_id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FlagIcon className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                {report.content_type.charAt(0).toUpperCase() + report.content_type.slice(1)} Report
                              </span>
                              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                                {report.reason}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 
                                className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
                                onClick={() => navigateToReportedContent(report)}
                                title="Click to view reported content"
                              >
                                {report.content_title}
                              </h4>
                              <button
                                onClick={() => navigateToReportedContent(report)}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="View reported content"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>Reported by: {report.reporter_username}</span>
                              <span>•</span>
                              <span>Content by: {report.content_author}</span>
                              <span>•</span>
                              <span>{report.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => navigateToReportedContent(report)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="View reported content"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Content
                            </button>
                            <button
                              onClick={() => resolveReport(report.report_id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              title="Mark as resolved"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Resolve
                            </button>
                            <button
                              onClick={() => dismissReport(report.report_id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              title="Dismiss report"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Dismiss
                            </button>
                            <button
                              onClick={() => deleteReport(report.report_id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              title="Delete report"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
