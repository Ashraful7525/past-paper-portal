import React from 'react';
import { 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const PostBody = ({ post, onSave, isSaving, formatNumber }) => {
  // Function to format content with proper line breaks and paragraphs
  const formatContent = (content) => {
    if (!content) return null;
    
    // Split content by double line breaks to create paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Handle single line breaks within paragraphs
      const lines = paragraph.split('\n').map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {line}
          {lineIndex < paragraph.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
      
      return (
        <p key={index} className="mb-4 last:mb-0">
          {lines}
        </p>
      );
    });
  };

  // Function to check if URL is an image
  const isImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  // Function to check if URL is a video
  const isVideoUrl = (url) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  // Function to render media content
  const renderMedia = (fileUrl, fileSize) => {
    if (!fileUrl) return null;

    if (isImageUrl(fileUrl)) {
      return (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
          <img
            src={fileUrl}
            alt="Post attachment"
            className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-800"
            loading="lazy"
          />
        </div>
      );
    }

    if (isVideoUrl(fileUrl)) {
      return (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
          <video
            src={fileUrl}
            controls
            className="w-full h-auto max-h-96 bg-gray-50 dark:bg-gray-800"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // For other file types, show download link
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <DocumentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              Attached File
            </p>
            {fileSize && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Size: {fileSize}
              </p>
            )}
          </div>
          <a
            href={fileUrl}
            download
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Download</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1">
      {/* Media Content */}
      {renderMedia(post.file_url, post.file_size)}

      {/* Main Content */}
      {post.content && (
        <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {formatContent(post.content)}
          </div>
        </div>
      )}

      {/* Preview Text (if different from content) */}
      {post.preview_text && post.preview_text !== post.content && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Preview
          </h3>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
            {post.preview_text}
          </p>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-full font-medium border border-gray-200 dark:border-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Enhanced Actions */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="font-medium">{formatNumber(post.solution_count || 0)} Solutions</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span className="font-medium">{formatNumber(post.download_count || 0)} Downloads</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <EyeIcon className="h-5 w-5" />
            <span className="font-medium">{formatNumber(post.view_count || 0)} Views</span>
          </div>
        </div>

        <button
          onClick={onSave}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            post.is_saved 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 shadow-lg' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
          }`}
          disabled={isSaving}
        >
          {post.is_saved ? (
            <BookmarkSolidIcon className="h-5 w-5" />
          ) : (
            <BookmarkIcon className="h-5 w-5" />
          )}
          <span>{post.is_saved ? 'Saved' : 'Save Post'}</span>
        </button>
      </div>
    </div>
  );
};

export default PostBody;