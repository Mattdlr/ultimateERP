/**
 * Modal Component
 * Reusable modal dialog with overlay, header, body, and footer sections
 *
 * Usage:
 * <Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
 *   <Modal.Body>
 *     Content goes here
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleClose}>Close</Button>
 *   </Modal.Footer>
 * </Modal>
 */

import React, { useEffect } from 'react';
import { XIcon } from './Icons';

export default function Modal({ isOpen, onClose, title, children, size = 'default' }) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const maxWidthClass = size === 'large' ? 'max-width: 800px;' : 'max-width: 500px;';

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth: maxWidthClass }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <XIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Sub-components
Modal.Body = function ModalBody({ children, className = '' }) {
  return <div className={`modal-body ${className}`}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return <div className={`modal-footer ${className}`}>{children}</div>;
};
