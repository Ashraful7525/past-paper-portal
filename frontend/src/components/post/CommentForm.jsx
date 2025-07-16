import React, { useState } from 'react';

const CommentForm = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "Add a thoughtful comment...", 
  buttonText = "Add Comment",
  isSubmitting = false,
  isReply = false 
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
  };

  const handleCancel = () => {
    setContent('');
    onCancel();
  };

  return (
    <div className={`${isReply ? 'p-3' : 'p-6'} border-2 border-gray-200 dark:border-gray-600 ${isReply ? 'rounded-lg' : 'rounded-xl'} bg-gray-50/50 dark:bg-gray-800/50`}>
      {!isReply && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          💬 Add Your Comment
        </h3>
      )}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${isReply ? 'p-2' : 'p-4'} border border-gray-300 dark:border-gray-600 ${isReply ? 'rounded-lg' : 'rounded-xl'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${isReply ? 'text-sm' : 'text-base'}`}
          rows={isReply ? 2 : 3}
          disabled={isSubmitting}
        />
        <div className={`flex justify-end ${isReply ? 'space-x-2' : 'space-x-3'} ${isReply ? 'mt-2' : 'mt-4'}`}>
          <button
            type="button"
            onClick={handleCancel}
            className={`${isReply ? 'px-3' : 'px-6'} py-2 ${isReply ? 'text-xs' : 'text-base'} text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`${isReply ? 'px-3' : 'px-6'} py-2 ${isReply ? 'text-xs' : 'text-base'} bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${!isReply ? 'shadow-lg hover:shadow-xl' : ''}`}
          >
            {isSubmitting ? (isReply ? 'Adding...' : 'Publishing...') : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;