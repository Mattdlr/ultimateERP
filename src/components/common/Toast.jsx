/**
 * Toast Component
 * Notification toast for user feedback
 *
 * Features:
 * - Success and error variants
 * - Auto-dismiss after timeout
 * - Manual dismiss
 * - Slide-in animation
 */

import React, { useEffect } from 'react';
import { CheckIcon, XIcon } from './Icons';

export default function Toast({
  message,
  type = 'success',
  onClose,
  duration = 3000,
  autoClose = true
}) {
  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckIcon /> : <XIcon />}
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '8px'
          }}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}
