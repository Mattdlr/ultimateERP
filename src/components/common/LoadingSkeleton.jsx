import React from 'react';

/**
 * Base skeleton component for loading states
 */
function Skeleton({ width = '100%', height = '20px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-elevated) 50%, var(--bg-tertiary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px',
        ...style
      }}
    />
  );
}

/**
 * Table skeleton for loading table data
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <Skeleton width="80%" height="12px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton width={colIndex === 0 ? '60%' : '80%'} height="16px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Card skeleton for loading card-based layouts
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="project-cards">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="project-card" style={{ cursor: 'default' }}>
          <div className="project-card-header">
            <Skeleton width="80px" height="24px" />
            <Skeleton width="60px" height="20px" style={{ borderRadius: '12px' }} />
          </div>
          <Skeleton width="90%" height="20px" style={{ marginBottom: '8px' }} />
          <Skeleton width="60%" height="16px" style={{ marginBottom: '16px' }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div>
              <Skeleton width="50%" height="12px" style={{ marginBottom: '4px' }} />
              <Skeleton width="70%" height="14px" />
            </div>
            <div>
              <Skeleton width="50%" height="12px" style={{ marginBottom: '4px' }} />
              <Skeleton width="70%" height="14px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Detail panel skeleton for loading detail views
 */
export function DetailSkeleton() {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <Skeleton width="200px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="150px" height="16px" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton width="100px" height="40px" style={{ borderRadius: '8px' }} />
          <Skeleton width="100px" height="40px" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      <div className="info-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="info-card">
            <Skeleton width="60%" height="12px" style={{ marginBottom: '8px' }} />
            <Skeleton width="80%" height="20px" />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px' }}>
        <Skeleton width="150px" height="20px" style={{ marginBottom: '16px' }} />
        <TableSkeleton rows={3} columns={3} />
      </div>
    </div>
  );
}

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export default Skeleton;
