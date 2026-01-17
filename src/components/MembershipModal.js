import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const MembershipModal = ({ isOpen, onClose, message }) => {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDashboardClick = () => {
    onClose();
    router.push('/dashboard');
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay - transparent with subtle backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white bg-opacity-90 backdrop-blur-md border border-black shadow-xl p-8 max-w-md mx-4 fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:bg-black hover:text-white transition duration-300 w-8 h-8 flex items-center justify-center border border-black"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Modal content */}
        <div className="text-center">
          {/* Title */}
          <h3 className="text-xl font-bold text-black mb-6">
            Membership Required
          </h3>

          {/* Message */}
          <p className="text-black mb-8 leading-relaxed">
            {message || 'Access to mindmap content requires a membership. Please upgrade your account to continue.'}
          </p>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDashboardClick}
              className="bg-white bg-opacity-80 text-black border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300 font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-80 text-black border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
