import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  BookmarkIcon,
  ChatBubbleLeftEllipsisIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';


const UserDashboard = () => {
  const { user, logout, isLoggingOut } = useAuth();

  const stats = [
    { name: 'Questions Solved', value: '24', icon: BookOpenIcon, color: 'bg-blue-500', change: '+5 this week' },
    { name: 'Bookmarks', value: '12', icon: BookmarkIcon, color: 'bg-green-500', change: '+2 this week' },
    { name: 'Comments', value: '8', icon: ChatBubbleLeftEllipsisIcon, color: 'bg-yellow-500', change: '+1 this week' },
    { name: 'Contribution Score', value: user?.contribution || '156', icon: ChartBarIcon, color: 'bg-purple-500', change: '+25 this month' },
  ];

  const recentActivity = [
    { action: 'Solved question', subject: 'Mathematics', detail: 'Calculus - Integration', time: '2 hours ago' },
    { action: 'Bookmarked solution', subject: 'Physics', detail: 'Quantum Mechanics', time: '4 hours ago' },
    { action: 'Added comment', subject: 'Chemistry', detail: 'Organic Chemistry', time: '1 day ago' },
    { action: 'Solved question', subject: 'Biology', detail: 'Cell Biology', time: '2 days ago' },
  ];

  const upcomingDeadlines = [
    { exam: 'Midterm Mathematics', date: 'March 15, 2025', daysLeft: 5 },
    { exam: 'Physics Quiz', date: 'March 20, 2025', daysLeft: 10 },
    { exam: 'Chemistry Lab Report', date: 'March 25, 2025', daysLeft: 15 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">Welcome back,</span>
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
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
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.action} in{' '}
                          <span className="font-medium">{activity.subject}</span>
                        </p>
                        <p className="text-xs text-gray-600">{activity.detail}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <BookOpenIcon className="h-5 w-5 mr-3" />
                    Browse Questions
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <BookmarkIcon className="h-5 w-5 mr-3" />
                    My Bookmarks
                  </button>
                  <Link to="/profile" className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <UserCircleIcon className="h-5 w-5 mr-3" />
                    Profile Settings
                  </Link>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <Cog6ToothIcon className="h-5 w-5 mr-3" />
                    Preferences
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deadline.exam}</p>
                        <p className="text-xs text-gray-500">{deadline.date}</p>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className={`text-xs font-medium ${
                          deadline.daysLeft <= 7 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {deadline.daysLeft} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
