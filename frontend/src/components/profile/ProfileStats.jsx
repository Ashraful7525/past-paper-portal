import React from 'react';
import { Award, BookOpen, MessageCircle, Bookmark, TrendingUp, Star } from 'lucide-react';

const ProfileStats = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      icon: BookOpen,
      label: 'Questions Asked',
      value: stats.questionsCount,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/70 dark:bg-blue-900/20',
      borderColor: 'border-blue-100 dark:border-blue-800/50'
    },
    {
      icon: MessageCircle,
      label: 'Solutions Provided',
      value: stats.solutionsCount,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/70 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-100 dark:border-emerald-800/50'
    },
    {
      icon: Bookmark,
      label: 'Bookmarked Items',
      value: stats.bookmarksCount,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/70 dark:bg-purple-900/20',
      borderColor: 'border-purple-100 dark:border-purple-800/50'
    },
    {
      icon: Award,
      label: 'Total Contribution',
      value: stats.contribution,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/70 dark:bg-amber-900/20',
      borderColor: 'border-amber-100 dark:border-amber-800/50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-4 py-3 border-b border-gray-100 dark:border-gray-600">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
            <h2 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Statistics</h2>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {statItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={`${item.bgColor} ${item.borderColor} rounded-lg p-3 transition-all duration-200 hover:shadow-sm hover:bg-opacity-100 border`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                        <Icon className={`w-3 h-3 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-300 truncate">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Academic activity
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {item.value || 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement Level Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-4 py-3 border-b border-gray-100 dark:border-gray-600">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-base font-bold text-gray-800 dark:text-white tracking-tight">Achievement Level</h3>
          </div>
        </div>

        <div className="p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-purple-100 dark:ring-purple-900/50 transition-all duration-200 hover:ring-6 hover:shadow-xl">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2 tracking-tight">
              {stats.contribution >= 500 ? 'Expert Scholar' : 
               stats.contribution >= 200 ? 'Advanced Learner' : 
               stats.contribution >= 50 ? 'Active Student' : 'Beginner'}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 font-medium">
              {stats.contribution >= 500 ? 'Outstanding academic contributions' : 
               stats.contribution >= 200 ? 'Consistent learning progress' : 
               stats.contribution >= 50 ? 'Good academic engagement' : 'Starting your journey'}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2 shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ 
                  width: `${Math.min((stats.contribution / 500) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {stats.contribution}/500 to Expert Scholar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
