import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/formatters';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  EyeIcon, 
  MessageCircleIcon,
  BookmarkIcon 
} from 'lucide-react';

const UserQuestionsList = ({ questions, isLoading, isError, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">
          Failed to load questions: {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          No questions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          You haven't asked any questions yet. Start by uploading a past paper or asking a question to the community!
        </p>
        <Link
          to="/feed"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Go to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Link
          key={question.post_id}
          to={`/post/${question.post_id}`}
          className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/25 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {question.title}
              </h3>
              
              {question.preview_text && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {question.preview_text}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>{question.upvotes || 0}</span>
                  <ArrowDownIcon className="w-4 h-4 ml-1" />
                  <span>{question.downvotes || 0}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{question.view_count || 0} views</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageCircleIcon className="w-4 h-4" />
                  <span>{question.solution_count || 0} solutions</span>
                </div>
                
                <span className="text-xs">
                  {formatTimeAgo(question.created_at)}
                </span>
              </div>
              
              {question.department_name && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {question.department_name}
                  </span>
                </div>
              )}
            </div>
            
            {question.is_featured && (
              <div className="ml-4 flex-shrink-0">
                <BookmarkIcon className="w-5 h-5 text-yellow-500" />
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserQuestionsList;