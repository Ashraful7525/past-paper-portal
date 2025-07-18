import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
