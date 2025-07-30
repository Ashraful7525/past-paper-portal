import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  UserIcon,
  StarIcon,
  FireIcon,
  PlusIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import CommentThread from './CommentThread';
import ReportModal from '../common/ReportModal';
import ProfilePicture from '../common/ProfilePicture';
import { useAuth } from '../../contexts/AuthContext';

const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url);
const isPDF = (url) => /\.pdf$/i.test(url);

const SolutionCard = ({ 
  solution, 
  onVote, 
  onBookmark, 
  onAddComment, 
  onReplyToComment,
  onVoteComment,
  isVoting, 
  isBookmarking, 
  isAddingComment, 
  isReplying,
  isVotingComment,
  formatNumber, 
  formatTimeAgo, 
  user 
}) => {
  const { user: currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const lightboxRef = useRef(null);
  const pdfModalRef = useRef(null);

  // Trap focus in modals for accessibility
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setLightboxOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen]);

  useEffect(() => {
    if (pdfModalOpen && pdfModalRef.current) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setPdfModalOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [pdfModalOpen]);

  // Debug logging to see what vote state we're getting
  console.log(`🎯 [SOLUTION CARD] Solution ${solution.id} vote state:`, {
    user_vote: solution.user_vote,
    user_vote_type: typeof solution.user_vote,
    upvotes: solution.upvotes,
    downvotes: solution.downvotes,
    net_votes: solution.net_votes,
    solution_id: solution.id
  });

  const handleVote = (voteType) => {
    const currentVote = solution.user_vote || 0;
    const newVoteType = currentVote === voteType ? 0 : voteType;
    console.log(`🎯 [SOLUTION CARD] Voting on solution ${solution.id}:`, {
      currentVote,
      voteType,
      newVoteType
    });
    onVote(solution.id, newVoteType);
  };

  const handleBookmark = () => {
    onBookmark(solution.id);
  };

  const handleAddComment = (content) => {
    onAddComment(solution.id, content);
  };

  const handleReplyToComment = (commentId, content) => {
    onReplyToComment(solution.id, commentId, content);
  };

  const handleVoteComment = (commentId, voteType) => {
    onVoteComment(solution.id, commentId, voteType);
  };

  return (
    <div 
      id={`solution-${solution.id}`}
      className="border-2 rounded-xl transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
    >
      <div className="p-6">
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Vote Section */}
          <div className="flex flex-row md:flex-col items-center space-x-4 md:space-x-0 md:space-y-2 mb-4 md:mb-0">
            <button
              onClick={() => handleVote(1)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                solution.user_vote === 1 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!user || isVoting}
              title={solution.user_vote === 1 ? 'You upvoted this - click to remove' : 'Upvote this solution'}
            >
              {solution.user_vote === 1 ? (
                <ChevronUpSolidIcon className="h-5 w-5" />
              ) : (
                <ChevronUpIcon className="h-5 w-5" />
              )}
            </button>
            
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${
              solution.user_vote === 1 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 
              solution.user_vote === -1 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
              'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
            }`}>
              {formatNumber(solution.net_votes || 0)}
            </span>
            
            <button
              onClick={() => handleVote(-1)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                solution.user_vote === -1 
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 shadow-sm' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!user || isVoting}
              title={solution.user_vote === -1 ? 'You downvoted this - click to remove' : 'Downvote this solution'}
            >
              {solution.user_vote === -1 ? (
                <ChevronDownSolidIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Enhanced Header with Profile Picture */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ProfilePicture 
                  user={{ 
                    username: solution.author_username, 
                    author_username: solution.author_username,
                    profile_picture_url: solution.author_profile_picture 
                  }} 
                  size="md" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800 dark:text-white">
                      {solution.author_username || 'Anonymous Scholar'}
                    </span>
                    {solution.author_contribution > 100 && (
                      <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                        <FireIcon className="h-3 w-3" />
                        <span className="text-xs font-bold">{solution.author_contribution}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(solution.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {solution.rating > 0 && (
                  <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full">
                    <StarIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{solution.rating}</span>
                  </div>
                )}
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    solution.is_bookmarked 
                      ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300' 
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  disabled={!user || isBookmarking}
                >
                  {solution.is_bookmarked ? (
                    <BookmarkSolidIcon className="h-5 w-5" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5" />
                  )}
                </button>
                
                {/* Report Button */}
                {currentUser && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    title="Report this solution"
                  >
                    <FlagIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Solution Content & File Preview */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* File Preview */}
              {solution.file_url && (
                <div className="flex-shrink-0 w-full md:w-56 lg:w-64">
                  {isImage(solution.file_url) ? (
                    <>
                      <img
                        src={solution.file_url}
                        alt="Solution Attachment Preview"
                        aria-label="Open full-size image preview"
                        className="w-full h-40 object-cover rounded border border-gray-300 dark:border-gray-600 cursor-pointer transition-transform hover:scale-105 shadow-sm"
                        style={{ maxWidth: '100%', maxHeight: '180px' }}
                        onClick={() => setLightboxOpen(true)}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter') setLightboxOpen(true); }}
                      />
                      {/* Lightbox Modal */}
                      {lightboxOpen && (
                        <div
                          ref={lightboxRef}
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
                            src={solution.file_url}
                            alt="Full Size Solution Attachment"
                            className="max-w-full max-h-full rounded shadow-lg border-4 border-white"
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </>
                  ) : isPDF(solution.file_url) ? (
                    <div className="w-full">
                      {/* PDF Attachment Label and Buttons */}
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">PDF Attachment</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPdfModalOpen(true)}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow transition-colors"
                            aria-label="Preview PDF"
                          >
                            Preview PDF
                          </button>
                          <a
                            href={solution.file_url}
                            download
                            className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded shadow transition-colors text-center"
                            aria-label="Download PDF"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                      
                      {/* PDF Preview Modal */}
                      {pdfModalOpen && (
                        <div
                          ref={pdfModalRef}
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
                          aria-modal="true"
                          role="dialog"
                          tabIndex={-1}
                          onClick={() => setPdfModalOpen(false)}
                        >
                          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">PDF Preview</h3>
                              <button
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
                                aria-label="Close PDF preview"
                                onClick={e => { e.stopPropagation(); setPdfModalOpen(false); }}
                              >
                                &times;
                              </button>
                            </div>
                            
                            {/* PDF Viewer */}
                            <div className="flex-1 overflow-hidden">
                              <iframe
                                src={solution.file_url}
                                title="PDF Preview"
                                className="w-full h-full"
                                loading="lazy"
                                aria-label="PDF preview"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 w-full text-gray-400 dark:text-gray-500">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7V3a2 2 0 012-2h6a2 2 0 012 2v4" />
                        <rect width="14" height="14" x="5" y="7" rx="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6" />
                      </svg>
                      <span className="text-xs">Unsupported file type</span>
                    </div>
                  )}
                </div>
              )}
              {/* Solution Text */}
              <div className="prose prose-gray dark:prose-invert max-w-none flex-1">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                  {solution.content}
                </p>
              </div>
            </div>

            {/* Tags */}
            {solution.tags && solution.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 mt-2">
                {solution.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-block bg-gray-100 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Solution Actions */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-1 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  data-expand-comments
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span className="font-medium">Comment</span>
                  <span className="font-medium">({solution.comment_count || 0})</span>
                </button>
                <div className="flex items-center space-x-1">
                  <ChevronUpIcon className="h-4 w-4" />
                  <span className="font-medium">{formatNumber(solution.upvotes || 0)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChevronDownIcon className="h-4 w-4" />
                  <span className="font-medium">{formatNumber(solution.downvotes || 0)}</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <CommentThread
                comments={solution.comments || []}
                onAddComment={handleAddComment}
                onReply={handleReplyToComment}
                onVoteComment={handleVoteComment}
                isAddingComment={isAddingComment}
                isReplying={isReplying}
                isVotingComment={isVotingComment}
                formatTimeAgo={formatTimeAgo}
                user={user}
              />
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="solution"
        contentId={solution.id}
        contentTitle={solution.title || 'Solution'}
      />
    </div>
  );
};

export default SolutionCard;