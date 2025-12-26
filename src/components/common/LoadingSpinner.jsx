import React from 'react';

/**
 * LoadingSpinner component for displaying loading states
 * @param {string} size - Size of spinner: 'small' (20px), 'medium' (40px), 'large' (60px)
 * @param {string} message - Optional message to display below spinner
 * @param {boolean} fullScreen - Whether to display in full screen mode
 */
export default function LoadingSpinner({ size = 'medium', message, fullScreen = false }) {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const spinner = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      ...(fullScreen ? { height: '100vh' } : { padding: '40px' })
    }}>
      <div
        className="spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-orange)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {message && (
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          {message}
        </p>
      )}
    </div>
  );

  return spinner;
}
