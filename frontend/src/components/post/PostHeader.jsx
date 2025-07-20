import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../../contexts/FilterContext';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  AcademicCapIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon
} from '@heroicons/react/24/solid';

const PostHeader = ({ post, onVote, isVoting, formatNumber, formatTimeAgo }) => {
  const navigate = useNavigate();
  const { filters } = useFilters();

  const handleVote = (voteType) => {
    const newVoteType = post.user_vote === voteType ? 0 : voteType;
    onVote(newVoteType);
  };

  const handleBackToFeed = () => {
    // Navigate back to feed with preserved filter state
    navigate('/feed', { 
      state: { 
        filters: filters,
        preserveFilters: true 
      } 
    });
  };

  return (
    <>
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={handleBackToFeed}
            className="flex items-center space-x-2 text-gray-200 hover:text-white mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Feed</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">{post.department_icon || '📚'}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-gray-200 mb-2">
                <span className="font-semibold">r/{post.department_name || 'General'}</span>
                <span>•</span>
                <span>by u/{post.author_username || 'Unknown'}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.is_verified && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <ShieldCheckIcon className="h-4 w-4" />
                      Verified
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex gap-6">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-3 pt-2">
              <button
                onClick={() => handleVote(1)}
                className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                  post.user_vote === 1 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' : 'text-gray-400 dark:text-gray-500'
                }`}
                disabled={isVoting}
              >
                {post.user_vote === 1 ? (
                  <ChevronUpSolidIcon className="h-8 w-8" />
                ) : (
                  <ChevronUpIcon className="h-8 w-8" />
                )}
              </button>
              
              <span className={`text-xl font-bold ${
                post.user_vote === 1 ? 'text-emerald-600' : 
                post.user_vote === -1 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {formatNumber((post.upvotes || 0) - (post.downvotes || 0))}
              </span>
              
              <button
                onClick={() => handleVote(-1)}
                className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                  post.user_vote === -1 ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 shadow-lg' : 'text-gray-400 dark:text-gray-500'
                }`}
                disabled={isVoting}
              >
                {post.user_vote === -1 ? (
                  <ChevronDownSolidIcon className="h-8 w-8" />
                ) : (
                  <ChevronDownIcon className="h-8 w-8" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Question Information */}
              {(post.course_title || post.semester_name || post.question_title || post.question_no) && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {post.course_title && (
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600">
                        <AcademicCapIcon className="h-4 w-4" />
                        <span className="font-semibold">{post.course_title}</span>
                      </div>
                    )}
                    {post.semester_name && (
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span className="font-semibold">{post.semester_name}</span>
                      </div>
                    )}
                    {post.question_year && (
                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-700">
                        <span className="font-semibold">{post.question_year}</span>
                      </div>
                    )}
                    {post.question_no && (
                      <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-700">
                        <span className="font-semibold">Q{post.question_no}</span>
                      </div>
                    )}
                  </div>
                  
                  {post.question_title && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        📋 Question: {post.question_title}
                      </h2>
                      {post.question_text && (
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {post.question_text}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostHeader;