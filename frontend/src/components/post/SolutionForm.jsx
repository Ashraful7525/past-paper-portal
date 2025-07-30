import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

const SolutionForm = ({
  onSubmit,
  onCancel,
  placeholder = "Share your solution, explanation, or insights that could help fellow students...",
  buttonText = "Publish Solution",
  isSubmitting = false,
  user
}) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    onSubmit(content.trim() || '', file); // Allow empty content if file is attached
    setContent('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setContent('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type (allow PDF, images)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please upload a PDF or image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Avatar with profile picture support
  const avatar = user ? (
    user.profile_picture_url ? (
      <img
        src={user.profile_picture_url}
        alt={user.username || 'User'}
        className="w-10 h-10 rounded-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    ) : null
  ) : null;

  const fallbackAvatar = user ? (
    <div 
      className={`w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold text-white select-none ${user.profile_picture_url ? 'hidden' : 'flex'}`}
    >
      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
    </div>
  ) : null;

  const isImage = (file) => file && file.type.startsWith('image/');
  const isPDF = (file) => file && file.type === 'application/pdf';

  return (
    <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl w-full shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Add Your Solution</h3>
        </div>

        {/* Input area: avatar + textarea */}
        <div className="flex flex-row items-start w-full px-4 pt-4 pb-2 gap-3">
          {user && (
            <div className="flex-shrink-0">
              {avatar}
              {fallbackAvatar}
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[120px]"
              rows={5}
              disabled={isSubmitting}
              aria-label={placeholder}
            />
          </div>
        </div>

        {/* File upload section */}
        <div className="px-4 pb-4">
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/30">
            {!file ? (
              <div className="flex items-center justify-center space-x-3 py-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Attach file (optional)
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, Image • Max 10MB
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white dark:bg-gray-600 rounded-md p-2 border border-gray-200 dark:border-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    {isImage(file) ? (
                      <PhotoIcon className="h-5 w-5 text-blue-500" />
                    ) : isPDF(file) ? (
                      <DocumentIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <DocumentIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  disabled={isSubmitting}
                  title="Remove file"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 px-4 pb-4 border-t border-gray-200 dark:border-gray-600 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !file)}
            className="px-6 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Publishing...' : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolutionForm;