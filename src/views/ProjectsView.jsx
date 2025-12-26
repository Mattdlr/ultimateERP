import { useState } from 'react';
import Icons from '../components/common/Icons';

export default function ProjectsView({ projects, customers, getCustomer, onSelectProject, onAddProject }) {
  const [statusFilter, setStatusFilter] = useState('in-progress');
  const [customerFilter, setCustomerFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'card' or 'table'

  const filteredProjects = projects.filter(project => {
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesCustomer = !customerFilter || project.customer_id === customerFilter;
    const matchesSearch = !searchQuery || project.title.toLowerCase().includes(searchQuery.toLowerCase()) || project.project_number.includes(searchQuery) || getCustomer(project.customer_id)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCustomer && matchesSearch;
  }).sort((a, b) => a.project_number.localeCompare(b.project_number));

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgressValue: projects.filter(p => p.status === 'in-progress').reduce((sum, p) => sum + parseFloat(p.value || 0), 0)
  };

  const inProgressProjects = projects.filter(p => p.status === 'in-progress').sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isOverdue = (project) => {
    if (project.status === 'completed' || !project.due_date) return false;
    return new Date(project.due_date) < new Date();
  };

  return (
    <>
      <div className="page-header">
        <div><h1 className="page-title">Projects</h1><p className="page-subtitle">Track and manage workshop projects</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowPrintPreview(true)}><Icons.Printer /> Print List</button>
          <button className="btn btn-primary" onClick={onAddProject}><Icons.Plus /> New Project</button>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-card-value">{stats.inProgress}</div><div className="stat-card-label">In Progress</div></div>
        <div className="stat-card"><div className="stat-card-value">{stats.onHold}</div><div className="stat-card-label">On Hold</div></div>
        <div className="stat-card"><div className="stat-card-value">{stats.completed}</div><div className="stat-card-label">Completed</div></div>
        <div className="stat-card"><div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>£{stats.inProgressValue.toLocaleString()}</div><div className="stat-card-label">In Progress Value</div></div>
      </div>
      <div className="search-box"><Icons.Search /><input type="text" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="filter-row">
          <button className={`filter-btn ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter(null)}>All<span className="count">{stats.total}</span></button>
          <button className={`filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`} onClick={() => setStatusFilter('in-progress')}>In Progress<span className="count">{stats.inProgress}</span></button>
          <button className={`filter-btn ${statusFilter === 'on-hold' ? 'active' : ''}`} onClick={() => setStatusFilter('on-hold')}>On Hold<span className="count">{stats.onHold}</span></button>
          <button className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`} onClick={() => setStatusFilter('completed')}>Completed<span className="count">{stats.completed}</span></button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {customerFilter && (
            <button className="btn btn-secondary btn-sm" onClick={() => setCustomerFilter(null)}>
              <Icons.X /> Clear Customer Filter
            </button>
          )}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 6, padding: 2 }}>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('table')}
              style={{ borderRadius: 4 }}
            >
              Table
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('card')}
              style={{ borderRadius: 4 }}
            >
              Cards
            </button>
          </div>
        </div>
      </div>
      {viewMode === 'card' ? (
        <div className="project-cards">
          {filteredProjects.map(project => {
            const customer = getCustomer(project.customer_id);
            const overdue = isOverdue(project);
            return (
              <div key={project.id} className="project-card" onClick={() => onSelectProject(project)}>
                <div className="project-card-header">
                  <span className="project-number">#{project.project_number}</span>
                  <span className={`project-status ${project.status}`}>{project.status.replace('-', ' ')}</span>
                </div>
                <div className="project-title">{project.title}</div>
                <div className="project-customer">{customer?.name || 'Unknown Customer'}</div>
                <div className="project-meta">
                  <div className="project-meta-item"><div className="project-meta-label">Due Date</div><div className={`project-meta-value ${overdue ? 'overdue' : ''}`}>{formatDate(project.due_date)}{overdue && ' ⚠️'}</div></div>
                  <div className="project-meta-item"><div className="project-meta-label">Value</div><div className="project-meta-value value">£{parseFloat(project.value || 0).toLocaleString()}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project #</th>
                <th>Customer</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => {
                const customer = getCustomer(project.customer_id);
                return (
                  <tr key={project.id} style={{ cursor: 'pointer' }}>
                    <td
                      onClick={() => onSelectProject(project)}
                      style={{ fontFamily: 'monospace', fontWeight: 600 }}
                    >
                      {project.project_number}
                    </td>
                    <td
                      onClick={() => setCustomerFilter(project.customer_id)}
                      style={{
                        cursor: 'pointer',
                        color: 'var(--accent-blue)',
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted'
                      }}
                      title="Click to filter by this customer"
                    >
                      {customer?.name || 'Unknown'}
                    </td>
                    <td onClick={() => onSelectProject(project)}>
                      {project.title}
                    </td>
                    <td onClick={() => onSelectProject(project)}>
                      {formatDate(project.date_started)}
                    </td>
                    <td onClick={() => onSelectProject(project)}>
                      {formatDate(project.due_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {filteredProjects.length === 0 && (<div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No projects found</div>)}
      {showPrintPreview && (
        <div className="print-preview-modal" onClick={() => setShowPrintPreview(false)}>
          <div className="print-preview-content" onClick={e => e.stopPropagation()}>
            <div className="print-preview-toolbar">
              <h3>Print Preview - In Progress Projects</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => window.print()}><Icons.Printer /> Print</button>
                <button className="btn btn-secondary" onClick={() => setShowPrintPreview(false)}>Close</button>
              </div>
            </div>
            <div className="print-preview-body">
              <div className="print-header"><h1>In Progress Projects</h1><p>Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
              <table className="print-table">
                <thead><tr><th style={{ width: 80 }}>Project #</th><th>Customer</th><th>Description</th><th style={{ width: 100 }}>Start Date</th><th style={{ width: 100 }}>Due Date</th></tr></thead>
                <tbody>
                  {inProgressProjects.map(project => {
                    const overdue = new Date(project.due_date) < new Date();
                    const customer = getCustomer(project.customer_id);
                    return (<tr key={project.id}><td style={{ fontFamily: 'monospace' }}>{project.project_number}</td><td>{customer?.name || '-'}</td><td>{project.title}</td><td>{formatDate(project.date_started)}</td><td style={overdue ? { color: '#dc2626', fontWeight: 'bold' } : {}}>{formatDate(project.due_date)}{overdue && ' ⚠'}</td></tr>);
                  })}
                </tbody>
              </table>
              <div className="print-footer">Total: {inProgressProjects.length} project{inProgressProjects.length !== 1 ? 's' : ''} in progress</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
