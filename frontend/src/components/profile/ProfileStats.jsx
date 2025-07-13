import React from 'react';
import { Award, BookOpen, MessageCircle, Bookmark } from 'lucide-react';

const ProfileStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500 dark:text-yellow-400" />
          User Statistics
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Questions Asked</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.questionsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Solutions Provided</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.solutionsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bookmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Bookmarked Items</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.bookmarksCount}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Total Contribution</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.contribution}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
