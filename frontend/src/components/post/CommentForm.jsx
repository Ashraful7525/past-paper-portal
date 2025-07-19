import React, { useState, forwardRef } from 'react';

const CommentForm = forwardRef(({ 
  onSubmit, 
  onCancel, 
  placeholder = "Add a thoughtful comment...", 
  buttonText = "Add Comment",
  isSubmitting = false,
  isReply = false 
}, ref) => {
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
    <div className={`${isReply ? 'p-2' : 'p-3'} border border-gray-200 dark:border-gray-600 ${isReply ? 'rounded-md' : 'rounded-lg'} bg-gray-50/50 dark:bg-gray-800/50`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 ${isReply ? 'p-2' : 'p-2'} border border-gray-300 dark:border-gray-600 ${isReply ? 'rounded-md' : 'rounded-lg'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none ${isReply ? 'text-sm' : 'text-base'}`}
          rows={1}
          style={{ minHeight: '40px', maxHeight: '120px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={`${isReply ? 'px-2' : 'px-4'} py-1.5 ${isReply ? 'text-xs' : 'text-sm'} bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          {isSubmitting ? (isReply ? 'Adding...' : 'Publishing...') : buttonText}
        </button>
      </form>
    </div>
  );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;