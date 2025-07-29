import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [moderationData, setModerationData] = useState({
    questions: [],
    solutions: [],
    comments: [],
    reports: [],
    loading: false
  });

  // Fetch moderation data
  const fetchModerationData = async () => {
    setModerationData(prev => ({ ...prev, loading: true }));
    try {
      const [questionsRes, solutionsRes, commentsRes, reportsRes] = await Promise.all([
        api.get('/admin/questions?status=pending'),
        api.get('/admin/solutions?status=pending'),
        api.get('/admin/comments?status=flagged'),
        api.get('/admin/reports?status=pending')
      ]);
      
      setModerationData({
        questions: questionsRes.data || [],
        solutions: solutionsRes.data || [],
        comments: commentsRes.data || [],
        reports: reportsRes.data || [],
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
      setModerationData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (activeTab !== 'overview') {
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
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Delete question error:', error);
    }
  };

  const deleteSolution = async (solutionId) => {
    if (!window.confirm('Are you sure you want to delete this solution? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/solutions/${solutionId}`);
      toast.success('Solution deleted successfully');
      fetchModerationData();
    } catch (error) {
      toast.error('Failed to delete solution');
      console.error('Delete solution error:', error);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/comments/${commentId}`);
      toast.success('Comment deleted successfully');
      fetchModerationData();
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Delete comment error:', error);
    }
  };

  // Approve functions
  const approveQuestion = async (questionId) => {
    try {
      await api.put(`/admin/questions/${questionId}/approve`);
      toast.success('Question approved successfully');
      fetchModerationData();
    } catch (error) {
      toast.error('Failed to approve question');
      console.error('Approve question error:', error);
    }
  };

  const approveSolution = async (solutionId) => {
    try {
      await api.put(`/admin/solutions/${solutionId}/approve`);
      toast.success('Solution approved successfully');
      fetchModerationData();
    } catch (error) {
      toast.error('Failed to approve solution');
      console.error('Approve solution error:', error);
    }
  };

  const approveComment = async (commentId) => {
    try {
      await api.put(`/admin/comments/${commentId}/approve`);
      toast.success('Comment approved successfully');
      fetchModerationData();
    } catch (error) {
      toast.error('Failed to approve comment');
      console.error('Approve comment error:', error);
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
    } catch (error) {
      toast.error('Failed to delete report');
      console.error('Delete report error:', error);
    }
  };

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
                { id: 'solutions', name: 'Solutions', icon: CheckCircleIcon },
                { id: 'comments', name: 'Comments', icon: ChatBubbleLeftEllipsisIcon },
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
                        onClick={() => setActiveTab('solutions')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-3" />
                        Moderate Solutions
                      </button>
                      <button 
                        onClick={() => setActiveTab('comments')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-3" />
                        Moderate Comments
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
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{question.title}</h4>
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

        {/* Solutions Moderation Tab */}
        {activeTab === 'solutions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Solutions Pending Moderation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and moderate submitted solutions</p>
              </div>
              <div className="p-6">
                {moderationData.loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : moderationData.solutions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending solutions</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All solutions have been reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderationData.solutions.map((solution) => (
                      <div key={solution.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{solution.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{solution.content}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>By: {solution.author}</span>
                              <span>•</span>
                              <span>Question: {solution.questionTitle}</span>
                              <span>•</span>
                              <span>Votes: +{solution.upvotes} -{solution.downvotes}</span>
                              <span>•</span>
                              <span>{solution.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => approveSolution(solution.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Verify
                            </button>
                            <button
                              onClick={() => deleteSolution(solution.id)}
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

        {/* Comments Moderation Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments Pending Moderation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and moderate flagged comments</p>
              </div>
              <div className="p-6">
                {moderationData.loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : moderationData.comments.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftEllipsisIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No flagged comments</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All comments have been reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderationData.comments.map((comment) => (
                      <div key={comment.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FlagIcon className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">Flagged Comment</span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">{comment.content}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>By: {comment.author}</span>
                              <span>•</span>
                              <span>On: {comment.solutionTitle}</span>
                              <span>•</span>
                              <span>Flags: {comment.flagCount}</span>
                              <span>•</span>
                              <span>{comment.createdAt}</span>
                            </div>
                            {comment.flagReason && (
                              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                  <strong>Flag reason:</strong> {comment.flagReason}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => approveComment(comment.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => deleteComment(comment.id)}
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
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                              {report.content_title}
                            </h4>
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
