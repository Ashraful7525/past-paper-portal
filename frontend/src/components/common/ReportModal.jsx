import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import { FlagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '../../utils/api';

const ReportModal = ({ isOpen, onClose, contentType, contentId, contentTitle }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = {
    question: [
      { value: 'inappropriate', label: 'Inappropriate Content' },
      { value: 'spam', label: 'Spam or Promotional' },
      { value: 'false_info', label: 'False Information' },
      { value: 'copyright', label: 'Copyright Violation' },
      { value: 'duplicate', label: 'Duplicate Question' },
      { value: 'off_topic', label: 'Off Topic' },
      { value: 'other', label: 'Other' }
    ],
    solution: [
      { value: 'incorrect', label: 'Incorrect Solution' },
      { value: 'inappropriate', label: 'Inappropriate Content' },
      { value: 'spam', label: 'Spam or Promotional' },
      { value: 'plagiarism', label: 'Plagiarism' },
      { value: 'misleading', label: 'Misleading Information' },
      { value: 'off_topic', label: 'Off Topic' },
      { value: 'other', label: 'Other' }
    ],
    comment: [
      { value: 'inappropriate', label: 'Inappropriate Language' },
      { value: 'harassment', label: 'Harassment or Bullying' },
      { value: 'spam', label: 'Spam or Promotional' },
      { value: 'false_info', label: 'False Information' },
      { value: 'off_topic', label: 'Off Topic' },
      { value: 'personal_attack', label: 'Personal Attack' },
      { value: 'other', label: 'Other' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.post('/reports', {
        contentType,
        contentId,
        reason
      });
      
      toast.success('Report submitted successfully. Thank you for helping us maintain quality content.');
      onClose();
      setReason('');
      setDescription('');
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('You have already reported this content');
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
      console.error('Report submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setReason('');
      setDescription('');
    }
  };

  const reasons = reportReasons[contentType] || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <FlagIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Report {contentType === 'question' ? 'Question' : contentType === 'comment' ? 'Comment' : 'Solution'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

      {/* Content Info */}
      {contentTitle && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Reporting:</span> {contentTitle}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for reporting *
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reasons.map((reasonOption) => (
              <label
                key={reasonOption.value}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reasonOption.value}
                  checked={reason === reasonOption.value}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {reasonOption.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional details (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="Please provide any additional information that might help us understand your report..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
              focus:ring-2 focus:ring-red-500 focus:border-red-500 
              dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
              resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description.length}/500 characters
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
              bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
              rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !reason}
            className="px-4 py-2 text-sm font-medium text-white 
              bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed
              rounded-md transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FlagIcon className="h-4 w-4" />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> False reports may result in account restrictions. 
          Please only report content that genuinely violates our community guidelines.
        </p>
      </div>
      </div>
    </Modal>
  );
};

export default ReportModal;
