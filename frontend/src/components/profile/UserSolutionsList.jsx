import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/formatters';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CheckCircleIcon,
  MessageCircleIcon,
  FileTextIcon 
} from 'lucide-react';

const UserSolutionsList = ({ solutions, isLoading, isError, error }) => {
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
          Failed to load solutions: {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!solutions || solutions.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileTextIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          No solutions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          You haven't submitted any solutions yet. Help the community by providing solutions to questions!
        </p>
        <Link
          to="/feed"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Find Questions to Answer
        </Link>
      </div>
    );
  }

  const handleSolutionClick = (e, questionId, solutionId) => {
    // Allow the link to navigate first, then scroll to solution
    setTimeout(() => {
      const solutionElement = document.getElementById(`solution-${solutionId}`);
      if (solutionElement) {
        solutionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Add a subtle highlight effect
        solutionElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          solutionElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 3000);
      }
    }, 100);
  };

  return (
    <div className="space-y-4">
      {solutions.map((solution) => {
        // Use post_id from the backend response, fallback to question_id if needed
        const postUrl = `/post/${solution.post_id}?highlight=solution&id=${solution.id}`;
        
        return (
          <Link
            key={solution.id}
            to={postUrl}
            onClick={(e) => handleSolutionClick(e, solution.post_id, solution.id)}
            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/25 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {solution.is_verified && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {solution.question_title || solution.post_title || 'Solution'}
                  </h3>
                </div>
                
                {solution.content && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {solution.content.length > 200 
                      ? `${solution.content.substring(0, 200)}...` 
                      : solution.content
                    }
                  </p>
                )}
                
                {solution.question_text && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">
                      Question
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {solution.question_text}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <ArrowUpIcon className="w-4 h-4" />
                    <span>{solution.upvotes || 0}</span>
                    <ArrowDownIcon className="w-4 h-4 ml-1" />
                    <span>{solution.downvotes || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageCircleIcon className="w-4 h-4" />
                    <span>{solution.comment_count || 0} comments</span>
                  </div>
                  
                  <span className="text-xs">
                    {formatTimeAgo(solution.created_at)}
                  </span>
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  {solution.is_verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      Verified Solution
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Pending Review
                    </span>
                  )}
                  
                  {solution.net_votes > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      +{solution.net_votes} votes
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default UserSolutionsList;