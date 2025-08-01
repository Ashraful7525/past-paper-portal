import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftIcon, 
  EyeIcon, 
  BookmarkIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Modal from '../common/Modal';
import ReportModal from '../common/ReportModal';
import { useAuth } from '../../contexts/AuthContext';

const PostBody = ({ post, onSave, isSaving, formatNumber, solutionsCount }) => {
  const { user } = useAuth();
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Function to check if URL is an image
  const isImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  // Function to check if URL is a video
  const isVideoUrl = (url) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  // Function to check if URL is a PDF
  const isPdfUrl = (url) => {
    return /\.pdf$/i.test(url);
  };



  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen && e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);



  const handleImageClick = () => {
    setLightboxOpen(true);
  };

  const handleDownload = async (fileUrl) => {
    if (!fileUrl || isDownloading) return;

    setIsDownloading(true);
    
    try {
      // Get the filename from the URL or create a default one
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || `${post.title || 'file'}.${fileUrl.split('.').pop()}`;
      
      // Fetch the file
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to opening in new tab
      window.open(fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };
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

  // Function to render media content
  const renderMedia = (fileUrl, fileSize) => {
    if (!fileUrl) return null;

    if (isImageUrl(fileUrl)) {
      return (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
          <img
            src={fileUrl}
            alt="Post attachment"
            className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity duration-200"
            loading="lazy"
            onClick={handleImageClick}
            title="Click to view larger image"
          />
          {/* Removed download button for images as per request */}
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
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => handleDownload(fileUrl)}
              disabled={isDownloading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDownloading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>
          </div>
        </div>
      );
    }

    if (isPdfUrl(fileUrl)) {
      return (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <DocumentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                PDF Attachment
              </p>
              {fileSize && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Size: {fileSize}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowPdfPreview(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
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
          <button
            onClick={() => handleDownload(fileUrl)}
            disabled={isDownloading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isDownloading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>
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
      {/* Removed preview text section as per request */}

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
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="font-medium">{formatNumber(solutionsCount || 0)} Solutions</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <EyeIcon className="h-5 w-5" />
            <span className="font-medium">{formatNumber(post.view_count || 0)} Views</span>
          </div>
          
          {/* Report Button */}
          {user && (
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all duration-200"
              title="Report this question"
            >
              <FlagIcon className="h-5 w-5" />
              <span className="font-medium">Report</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {post.file_url && isPdfUrl(post.file_url) && (
            <>
              <button
                onClick={() => handleDownload(post.file_url)}
                disabled={isDownloading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDownloading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isDownloading ? (
                  <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
                ) : (
                  <ArrowDownTrayIcon className="h-4 w-4" />
                )}
                <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </>
          )}
          {post.file_url && !isPdfUrl(post.file_url) && (
            <button
              onClick={() => handleDownload(post.file_url)}
              disabled={isDownloading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isDownloading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isDownloading ? (
                <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <ArrowDownTrayIcon className="h-4 w-4" />
              )}
              <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>
          )}

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

      {/* PDF Preview Modal */}
      {post.file_url && isPdfUrl(post.file_url) && (
        <Modal isOpen={showPdfPreview} onClose={() => setShowPdfPreview(false)}>
          <div className="w-full h-[85vh] flex flex-col">
            <iframe
              src={post.file_url}
              title="PDF Preview"
              className="flex-1 w-full rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ minHeight: '75vh' }}
            />
            <a
              href={post.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-600 hover:underline text-center"
            >
              Open in new tab
            </a>
          </div>
        </Modal>
      )}

            {/* Lightbox Modal */}
      {lightboxOpen && post.file_url && isImageUrl(post.file_url) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          aria-modal="true"
          role="dialog"
          tabIndex={-1}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold bg-black bg-opacity-40 rounded-full px-3 py-1 hover:bg-opacity-70 focus:outline-none"
            aria-label="Close image preview"
            onClick={e => { e.stopPropagation(); setLightboxOpen(false); }}
          >
            &times;
          </button>
          <img
            src={post.file_url}
            alt="Full Size Post Attachment"
            className="max-w-full max-h-full rounded shadow-lg border-4 border-white"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="post"
        contentId={post.post_id}
        contentTitle={post.title}
      />
    </div>
  );
};

export default PostBody;