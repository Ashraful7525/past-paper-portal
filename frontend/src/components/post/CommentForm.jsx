import React, { useState, forwardRef } from 'react';

const CommentForm = forwardRef(({
  onSubmit,
  onCancel,
  placeholder = "Add a thoughtful comment...",
  buttonText = "Comment",
  isSubmitting = false,
  isReply = false,
  user
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

  // Avatar: first letter of username or fallback
  const avatar = user ? (
    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-base font-bold text-white select-none">
      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
    </div>
  ) : null;

  return (
    <div className={`${isReply ? '' : 'border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900'} rounded-xl w-full`}>
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        {/* Input area: avatar + textarea */}
        <div className="flex flex-row items-start w-full px-2 pt-2 pb-1">
          {avatar && (
            <div className="mt-2 ml-1 mr-2">{avatar}</div>
          )}
          <textarea
            ref={ref}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-2 text-sm border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none min-h-[36px] max-h-[120px] w-full mt-1.5"
            rows={1}
            style={{ minHeight: '36px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            disabled={isSubmitting}
            aria-label={placeholder}
          />
        </div>
        {/* Always show horizontal bar for both comment and reply forms */}
        <div className="border-t border-gray-200 dark:border-gray-600 mx-2" />
        {/* Action buttons below the bar */}
        <div className="flex justify-end gap-2 mt-2 mb-2 pr-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded"
            tabIndex={-1}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing...' : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;