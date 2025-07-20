import React from 'react';
import { Filter, ChevronLeft, ChevronRight, Upload, Flame, Clock, TrendingUp, BookOpen, Users, MessageCircle, Heart } from 'lucide-react';

const LeftSidebar = ({ 
  sortBy, 
  onSortChange, 
  timeRange, 
  onTimeRangeChange, 
  isCollapsed, 
  onToggleCollapse,
  onShowUploadModal,
  forYou,
  onForYouChange
}) => {
  const sortOptions = [
    { key: 'hot', label: 'Hot', icon: Flame, description: 'Trending posts', color: 'text-red-500' },
    { key: 'new', label: 'New', icon: Clock, description: 'Latest posts', color: 'text-blue-500' },
    { key: 'top', label: 'Top', icon: TrendingUp, description: 'Most upvoted', color: 'text-emerald-500' },
  ];

  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'year', label: 'Past Year' },
    { value: 'month', label: 'Past Month' },
    { value: 'week', label: 'Past Week' },
    { value: 'day', label: 'Past Day' },
  ];

  return (
    <div className={`fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } z-30`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button - Circular and attached to edge */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-md z-10"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6">
          {/* Sort Options */}
          <div className="px-3 mb-6">
            {!isCollapsed && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
                  Sort Posts
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => onSortChange(option.key)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'} rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === option.key
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    title={isCollapsed ? option.label : undefined}
                  >
                    <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${
                        sortBy === option.key ? option.color : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    {!isCollapsed && (
                      <span className="ml-3">{option.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* For You Button */}
          <div className="px-3 mb-6">
            <button 
              onClick={() => onForYouChange(!forYou)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'} rounded-lg text-sm font-medium transition-all duration-200 ${
                forYou
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-600'
              }`}
              title={isCollapsed ? 'For You' : undefined}
            >
              <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center`}>
                <Heart className={`h-4 w-4 ${forYou ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              {!isCollapsed && (
                <span className="ml-3">For You</span>
              )}
            </button>
          </div>

          {/* Upload Button */}
          <div className="px-3 mb-6">
            <button 
              onClick={onShowUploadModal}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md`}
              title={isCollapsed ? 'Upload Paper' : undefined}
            >
              <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center`}>
                <Upload className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <span className="ml-3">Upload Paper</span>
              )}
            </button>
          </div>

          {/* Time Range */}
          {!isCollapsed && (
            <div className="px-3">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
                  Time Range
                </h3>
              </div>
              <select
                value={timeRange}
                onChange={(e) => onTimeRangeChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;