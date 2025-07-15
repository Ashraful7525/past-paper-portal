import React, { useState } from 'react';
import { TrendingUp, Award, Users, BookOpen, MessageCircle, Star, Activity, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

const DepartmentSidebar = ({ departments, selectedDepartment, onDepartmentSelect, globalStats }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show only top 10 departments by default, or all if expanded
  const displayedDepartments = isExpanded ? departments : departments.slice(0, 10);
  const hasMoreDepartments = departments.length > 10;

  return (
    <div className="space-y-6 sticky top-6">
      {/* Top Departments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Departments
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full font-medium">
              {isExpanded ? departments.length : Math.min(10, departments.length)} of {departments.length}
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <button
            onClick={() => onDepartmentSelect(null)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
              !selectedDepartment 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700 shadow-sm' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">🏠</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">All Departments</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    View all posts
                  </div>
                </div>
              </div>
              {!selectedDepartment && (
                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </button>
          
          {displayedDepartments.map((dept) => {
            const percentage = dept.trend_percentage || 0;
            
            return (
              <button
                key={dept.department_id}
                onClick={() => onDepartmentSelect(dept.department_id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
                  selectedDepartment === dept.department_id 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-lg">{dept.icon || '📚'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={dept.department_name}>
                        {dept.department_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {dept.post_count?.toLocaleString() || 0} posts • {dept.solution_count?.toLocaleString() || 0} solutions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {percentage > 0 && (
                      <div className="flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                        <BarChart3 className="h-3 w-3" />
                        <span>{percentage}%</span>
                      </div>
                    )}
                    {selectedDepartment === dept.department_id && (
                      <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          
          {hasMoreDepartments && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <div className="flex items-center justify-center space-x-2">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span className="text-sm font-medium">Show {departments.length - 10} More</span>
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Award className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Platform Stats
            </h3>
            <Activity className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Total Posts</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Questions & Papers</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {globalStats?.total_posts?.toLocaleString() || 0}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Active Users</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">This month</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {globalStats?.active_users?.toLocaleString() || 0}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Total Solutions</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Answers provided</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {globalStats?.total_solutions?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Total Comments</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Discussions</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {globalStats?.total_comments?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSidebar;