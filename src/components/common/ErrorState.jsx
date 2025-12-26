import React from 'react';
import Icons from './Icons';

/**
 * ErrorState component for displaying error messages with retry functionality
 * @param {string} message - Error message to display
 * @param {Function} onRetry - Callback function to retry the failed operation
 * @param {boolean} compact - Whether to display a compact version
 */
export default function ErrorState({
  message = 'Failed to load data',
  onRetry,
  compact = false
}) {
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '8px'
      }}>
        <Icons.AlertCircle style={{ color: '#ef4444', width: '20px', height: '20px' }} />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {message}
        </span>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
            <Icons.RefreshCw style={{ width: '16px', height: '16px' }} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '28px'
        }}>
          <Icons.AlertCircle style={{ color: '#ef4444', width: '32px', height: '32px' }} />
        </div>

        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          Something went wrong
        </h3>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          {message}. Please try again or contact support if the problem persists.
        </p>

        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            <Icons.RefreshCw style={{ width: '16px', height: '16px' }} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
