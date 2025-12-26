import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Icons from './components/common/Icons';
import StockCalculations from './utils/stockCalculations';
import PartNumberUtils from './utils/partNumberUtils';
import './styles/global.css';

// Import extracted view components
import ProjectDetailView from './views/ProjectDetailView';
import PartDetailView from './views/PartDetailView';

// Inject styles (kept for backward compatibility during transition)
const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg-primary: #0a0a0b; --bg-secondary: #141417; --bg-tertiary: #1c1c21; --bg-elevated: #232329;
    --text-primary: #f5f5f7; --text-secondary: #a1a1a6; --text-muted: #6e6e73;
    --accent-orange: #ff6b35; --accent-blue: #4a9eff; --accent-green: #34d399;
    --border-subtle: #2a2a2f; --border-medium: #3a3a3f;
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.5; }
  .app-container { min-height: 100vh; display: flex; flex-direction: column; }
  .loading-container { display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 16px; }
  .spinner { width: 40px; height: 40px; border: 3px solid var(--border-subtle); border-top-color: var(--accent-orange); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: linear-gradient(135deg, var(--bg-primary) 0%, #1a1a1f 100%); }
  .login-box { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  .login-logo { text-align: center; margin-bottom: 32px; }
  .login-logo-icon { width: 64px; height: 64px; background: linear-gradient(135deg, var(--accent-orange), #ff8c5a); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; margin: 0 auto 16px; }
  .login-logo h1 { font-size: 24px; font-weight: 600; color: var(--text-primary); }
  .login-logo p { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
  .login-form { display: flex; flex-direction: column; gap: 16px; }
  .login-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; padding: 12px; border-radius: 8px; font-size: 14px; }
  .header { background: var(--bg-secondary); border-bottom: 1px solid var(--border-subtle); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon { width: 42px; height: 42px; background: linear-gradient(135deg, var(--accent-orange), #ff8c5a); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: white; }
  .logo-text { font-size: 18px; font-weight: 600; color: var(--text-primary); }
  .logo-subtitle { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .header-stats { display: flex; gap: 24px; }
  .stat { text-align: center; }
  .stat-value { font-size: 20px; font-weight: 600; color: var(--accent-orange); }
  .stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .user-menu { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 8px; }
  .user-email { font-size: 13px; color: var(--text-secondary); }
  .logout-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; }
  .logout-btn:hover { color: #ef4444; }
  .main-content { display: flex; flex: 1; }
  .sidebar { width: 240px; background: var(--bg-secondary); border-right: 1px solid var(--border-subtle); padding: 20px 0; overflow-y: auto; }
  .nav-section { margin-bottom: 24px; }
  .nav-section-title { padding: 0 20px; margin-bottom: 8px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 20px; color: var(--text-secondary); cursor: pointer; transition: all 0.15s ease; font-size: 14px; }
  .nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
  .nav-item.active { background: rgba(255,107,53,0.1); color: var(--accent-orange); border-right: 3px solid var(--accent-orange); }
  .content-area { flex: 1; padding: 24px; overflow-y: auto; max-height: calc(100vh - 74px); }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .page-title { font-size: 24px; font-weight: 600; }
  .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; border: none; }
  .btn-primary { background: var(--accent-orange); color: white; }
  .btn-primary:hover { background: #ff8c5a; }
  .btn-primary:disabled { background: var(--bg-tertiary); color: var(--text-muted); cursor: not-allowed; }
  .btn-secondary { background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-subtle); }
  .btn-secondary:hover { background: var(--bg-elevated); border-color: var(--border-medium); }
  .btn-ghost { background: transparent; color: var(--text-secondary); }
  .btn-ghost:hover { background: var(--bg-tertiary); color: var(--text-primary); }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
  .form-input, .form-select, .form-textarea { width: 100%; padding: 10px 14px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-primary); font-size: 14px; transition: border-color 0.15s ease; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--accent-orange); }
  .form-input::placeholder { color: var(--text-muted); }
  .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; }
  .table-container { overflow-x: auto; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-secondary); }
  .table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border-subtle); }
  .table tbody tr:hover { background: var(--bg-tertiary); }
  .project-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
  .project-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.15s ease; }
  .project-card:hover { border-color: var(--accent-orange); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .project-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .project-number { font-family: 'Monaco', 'Consolas', monospace; font-size: 14px; font-weight: 600; color: var(--accent-orange); background: rgba(255,107,53,0.1); padding: 4px 10px; border-radius: 6px; }
  .project-status { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 12px; }
  .project-status.in-progress { background: rgba(74,158,255,0.15); color: var(--accent-blue); }
  .project-status.on-hold { background: rgba(251,191,36,0.15); color: #fbbf24; }
  .project-status.completed { background: rgba(52,211,153,0.15); color: var(--accent-green); }
  .project-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
  .project-customer { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
  .project-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-subtle); }
  .project-meta-item { font-size: 12px; }
  .project-meta-label { color: var(--text-muted); margin-bottom: 2px; }
  .project-meta-value { color: var(--text-primary); font-weight: 500; }
  .project-meta-value.value { font-family: 'Monaco', 'Consolas', monospace; color: var(--accent-green); }
  .project-meta-value.overdue { color: #ef4444; }
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--bg-secondary); border-radius: 10px; padding: 16px 20px; text-align: center; }
  .stat-card-value { font-family: 'Monaco', 'Consolas', monospace; font-size: 28px; font-weight: 600; color: var(--accent-orange); }
  .stat-card-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
  .filter-row { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .filter-btn { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-secondary); cursor: pointer; transition: all 0.15s ease; }
  .filter-btn:hover { border-color: var(--accent-orange); color: var(--text-primary); }
  .filter-btn.active { background: var(--accent-orange); border-color: var(--accent-orange); color: white; }
  .filter-btn .count { background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 6px; }
  .filter-btn:not(.active) .count { background: var(--bg-tertiary); }
  .search-box { display: flex; align-items: center; gap: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
  .search-box svg { color: var(--text-muted); }
  .search-box input { flex: 1; background: none; border: none; color: var(--text-primary); font-size: 14px; outline: none; }
  .search-box input::placeholder { color: var(--text-muted); }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .modal { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
  .modal-title { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
  .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; }
  .modal-close:hover { color: var(--text-primary); }
  .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; gap: 12px; }
  .detail-panel { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px; }
  .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
  .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .info-card { background: var(--bg-tertiary); border-radius: 10px; padding: 16px; }
  .info-label { font-size: 11px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .info-value { font-size: 16px; font-weight: 600; color: var(--text-primary); }
  .info-value.money { font-family: 'Monaco', 'Consolas', monospace; color: var(--accent-green); font-size: 20px; }
  .notes-section { background: var(--bg-tertiary); border-radius: 12px; padding: 20px; margin-top: 20px; }
  .notes-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .notes-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .notes-list { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; }
  .note-item { background: var(--bg-secondary); border-radius: 8px; padding: 12px 16px; border-left: 3px solid var(--accent-orange); }
  .note-timestamp { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-family: 'Monaco', 'Consolas', monospace; }
  .note-text { font-size: 14px; color: var(--text-primary); line-height: 1.5; }
  .add-note-form { display: flex; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle); }
  .add-note-form textarea { flex: 1; min-height: 60px; resize: vertical; }
  .add-note-form button { align-self: flex-end; }
  .status-buttons { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--bg-elevated); border: 1px solid var(--border-medium); border-radius: 10px; padding: 14px 20px; display: flex; align-items: center; gap: 10px; color: var(--text-primary); box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 2000; animation: slideIn 0.3s ease; }
  .toast.success { border-left: 3px solid var(--accent-green); }
  .toast.error { border-left: 3px solid #ef4444; }
  @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .autocomplete-container { position: relative; }
  .autocomplete-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 8px; margin-top: 4px; max-height: 250px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .autocomplete-item { padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--border-subtle); }
  .autocomplete-item:last-child { border-bottom: none; }
  .autocomplete-item:hover, .autocomplete-item.highlighted { background: var(--bg-tertiary); }
  .autocomplete-item-name { font-weight: 500; color: var(--text-primary); }
  .autocomplete-item-detail { font-size: 12px; color: var(--text-muted); }
  .autocomplete-selected { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,107,53,0.1); border: 1px solid var(--accent-orange); border-radius: 6px; padding: 8px 12px; }
  .autocomplete-selected button { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; }
  .autocomplete-selected button:hover { color: #ef4444; }
  .print-preview-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .print-preview-content { background: white; border-radius: 12px; max-width: 800px; width: 100%; max-height: 90vh; overflow: auto; color: #1a1a1a; }
  .print-preview-toolbar { position: sticky; top: 0; background: var(--bg-secondary); padding: 12px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
  .print-preview-toolbar h3 { color: var(--text-primary); margin: 0; }
  .print-preview-body { padding: 30px; }
  .print-preview-body .print-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #333; }
  .print-preview-body .print-header h1 { font-size: 20px; margin: 0 0 6px 0; }
  .print-preview-body .print-header p { font-size: 13px; color: #666; margin: 0; }
  .print-preview-body .print-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .print-preview-body .print-table th { background: #f0f0f0; border: 1px solid #ccc; padding: 10px 12px; text-align: left; font-weight: 600; }
  .print-preview-body .print-table td { border: 1px solid #ccc; padding: 10px 12px; }
  .print-preview-body .print-table tr:nth-child(even) td { background: #f9f9f9; }
  .print-preview-body .print-footer { margin-top: 24px; font-size: 11px; color: #999; text-align: right; }
  .label-preview-body { padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 300px; background: #f5f5f5; }
  .project-label { width: 100mm; height: 50mm; background: white; border: 2px solid #333; padding: 12px; display: flex; flex-direction: column; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .label-project-number { font-size: 24px; font-weight: bold; color: #1a1a1a; font-family: monospace; }
  .label-customer { font-size: 14px; font-weight: 600; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
  .label-description { font-size: 12px; color: #666; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
  .mobile-menu-btn { display: none; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 12px; color: var(--text-primary); cursor: pointer; }
  .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; }
  .sidebar-overlay.visible { display: block; }
  .sidebar-close-btn { display: none; position: absolute; top: 16px; right: 16px; background: var(--bg-tertiary); border: none; border-radius: 6px; padding: 8px; color: var(--text-secondary); cursor: pointer; }
  @media (max-width: 768px) {
    .header { padding: 12px 16px; }
    .header-stats { display: none; }
    .mobile-menu-btn { display: flex; }
    .main-content { display: block; }
    .sidebar { position: fixed; top: 0; left: -280px; width: 280px; height: 100vh; z-index: 1000; transition: left 0.3s ease; padding-top: 60px; }
    .sidebar.open { left: 0; }
    .sidebar-close-btn { display: block; }
    .content-area { padding: 16px; max-height: none; }
    .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .project-cards { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .info-grid { grid-template-columns: repeat(2, 1fr); }
    .add-note-form { flex-direction: column; }
    .add-note-form button { width: 100%; }
  }
  @media print {
    body * { visibility: hidden; }
    .print-preview-modal, .print-preview-modal * { visibility: visible; }
    .print-preview-toolbar { display: none !important; }
    .print-preview-modal { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: white !important; padding: 0 !important; margin: 0 !important; }
    .print-preview-content { max-width: none !important; max-height: none !important; box-shadow: none !important; margin: 0 !important; }
    .print-preview-body { padding: 20px !important; }
    .print-table { width: 100% !important; }
    .label-preview-body { padding: 0 !important; background: white !important; display: block !important; min-height: auto !important; }
    .project-label { width: 100mm !important; height: 50mm !important; margin: 0 !important; border: 2px solid #000 !important; box-shadow: none !important; page-break-after: always; }
  }
`;

// Note: Icons, StockCalculations, and PartNumberUtils are now imported from separate modules

// ============================================
// LOGIN COMPONENT
// ============================================
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      onLogin(data.user);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-icon">ERP</div>
          <h1>Workshop ERP</h1>
          <p>Engineering Management System</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
function MainApp({ user, onLogout }) {
  const [activeView, setActiveView] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]); // Unified contacts (replaces customers and suppliers)
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Parts management state
  const [parts, setParts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [machines, setMachines] = useState([]);
  const [bomRelations, setBomRelations] = useState([]);
  const [operations, setOperations] = useState([]);
  const [partRevisions, setPartRevisions] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  // Project check-ins state
  const [checkins, setCheckins] = useState([]);
  const [checkinItems, setCheckinItems] = useState([]);

  // Delivery notes state
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [deliveryNoteItems, setDeliveryNoteItems] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: contactsData } = await supabase.from('contacts').select('*').order('name');
      const { data: projectsData } = await supabase.from('projects').select('*, project_notes (*)').order('project_number', { ascending: false });
      const { data: materialsData } = await supabase.from('materials').select('*').order('name');
      const { data: partsData } = await supabase.from('parts').select('*').order('part_number');
      const { data: machinesData } = await supabase.from('machines').select('*').order('name');
      const { data: bomData } = await supabase.from('bom_relations').select('*');
      const { data: operationsData } = await supabase.from('operations').select('*');
      const { data: checkinsData } = await supabase.from('project_checkins').select('*').order('checkin_date', { ascending: false });
      const { data: checkinItemsData } = await supabase.from('checkin_items').select('*');
      const { data: deliveryNotesData } = await supabase.from('delivery_notes').select('*').order('delivery_date', { ascending: false });
      const { data: deliveryNoteItemsData } = await supabase.from('delivery_note_items').select('*');
      const { data: partRevisionsData } = await supabase.from('part_revisions').select('*').order('created_at', { ascending: false });

      setContacts(contactsData || []);
      setProjects(projectsData || []);
      setMaterials(materialsData || []);
      setParts(partsData || []);
      setMachines(machinesData || []);
      setBomRelations(bomData || []);
      setPartRevisions(partRevisionsData || []);
      setOperations(operationsData || []);
      setCheckins(checkinsData || []);
      setCheckinItems(checkinItemsData || []);
      setDeliveryNotes(deliveryNotesData || []);
      setDeliveryNoteItems(deliveryNoteItemsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Error loading data', 'error');
    }
    setLoading(false);
  };

  // Helper functions to get contacts by role
  const customers = contacts.filter(c => c.is_customer && !c.deleted_at);
  const suppliers = contacts.filter(c => c.is_supplier && !c.deleted_at);
  const getCustomer = (customerId) => contacts.find(c => c.id === customerId);
  const getSupplier = (supplierId) => contacts.find(c => c.id === supplierId);

  const getNextProjectNumber = () => {
    const maxNum = projects.reduce((max, p) => {
      const num = parseInt(p.project_number);
      return num > max ? num : max;
    }, 0);
    return String(maxNum + 1).padStart(4, '0');
  };

  const handleAddProject = async (projectData, numberOfCopies = 1) => {
    try {
      const createdProjects = [];

      // Get starting project number and increment for each copy
      let currentProjectNumber = parseInt(getNextProjectNumber());

      // Create the specified number of copies
      for (let i = 0; i < numberOfCopies; i++) {
        const { data, error } = await supabase.from('projects').insert({
          project_number: String(currentProjectNumber).padStart(4, '0'),
          title: projectData.title,
          customer_id: projectData.customerId,
          date_started: projectData.dateStarted,
          due_date: projectData.dueDate,
          value: parseFloat(projectData.value) || 0,
          status: 'in-progress'
        }).select().single();

        if (error) throw error;
        createdProjects.push({ ...data, project_notes: [] });
        currentProjectNumber++; // Increment for next project
      }

      // Update projects list with all new projects
      setProjects([...createdProjects, ...projects]);

      // Show appropriate toast message
      if (numberOfCopies === 1) {
        showToast(`Project ${createdProjects[0].project_number} created`);
      } else {
        const projectNumbers = createdProjects.map(p => p.project_number).join(', ');
        showToast(`${numberOfCopies} projects created: ${projectNumbers}`);
      }

      // Don't close modal here - let the modal handle it based on "create another" checkbox
    } catch (err) {
      console.error('Error adding project:', err);
      showToast('Error creating project', 'error');
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      const { error } = await supabase.from('projects').update(updates).eq('id', projectId);
      if (error) throw error;
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
      if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, ...updates });
      showToast('Project updated');
    } catch (err) {
      console.error('Error updating project:', err);
      showToast('Error updating project', 'error');
    }
  };

  const handleAddNote = async (projectId, text) => {
    try {
      const { data, error } = await supabase.from('project_notes').insert({ project_id: projectId, text: text, created_by: user.id, created_by_email: user.email }).select().single();
      if (error) throw error;
      const updatedProjects = projects.map(p => p.id === projectId ? { ...p, project_notes: [...(p.project_notes || []), data] } : p);
      setProjects(updatedProjects);
      if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, project_notes: [...(selectedProject.project_notes || []), data] });
      showToast('Note added');
    } catch (err) {
      console.error('Error adding note:', err);
      showToast('Error adding note', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const { error } = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', projectId);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== projectId));
      setSelectedProject(null);
      showToast('Project deleted');
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast('Error deleting project', 'error');
    }
  };

  // ============================================
  // CONTACTS HANDLERS (Unified customers and suppliers)
  // ============================================
  const handleAddContact = async (contactData) => {
    try {
      const { data, error} = await supabase.from('contacts').insert({
        ...contactData,
        sync_status: 'local_only' // Default to local-only for new contacts
      }).select().single();
      if (error) throw error;
      setContacts([...contacts, data].sort((a, b) => a.name.localeCompare(b.name)));
      const roleLabel = data.is_customer && data.is_supplier ? 'Contact' : data.is_customer ? 'Customer' : 'Supplier';
      showToast(`${roleLabel} added`);
    } catch (err) {
      console.error('Error adding contact:', err);
      showToast('Error adding contact', 'error');
    }
  };

  const handleUpdateContact = async (contactId, updates) => {
    try {
      const { error } = await supabase.from('contacts').update(updates).eq('id', contactId);
      if (error) throw error;
      setContacts(contacts.map(c => c.id === contactId ? { ...c, ...updates } : c));
      showToast('Contact updated');
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast('Error updating contact', 'error');
    }
  };

  const handleDeleteContact = async (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    const inUseAsCustomer = contact?.is_customer && projects.some(p => p.customer_id === contactId);
    const inUseAsSupplier = contact?.is_supplier && parts.some(p => p.supplier_id === contactId);

    if (inUseAsCustomer && inUseAsSupplier) {
      showToast('Cannot delete: contact has projects and parts', 'error');
      return;
    }
    if (inUseAsCustomer) {
      showToast('Cannot delete: contact has projects', 'error');
      return;
    }
    if (inUseAsSupplier) {
      showToast('Cannot delete: contact has parts', 'error');
      return;
    }

    try {
      const { error } = await supabase.from('contacts').update({ deleted_at: new Date().toISOString() }).eq('id', contactId);
      if (error) throw error;
      setContacts(contacts.filter(c => c.id !== contactId));
      showToast('Contact deleted');
    } catch (err) {
      console.error('Error deleting contact:', err);
      showToast('Error deleting contact', 'error');
    }
  };

  // Legacy function names for backwards compatibility
  const handleAddCustomer = handleAddContact;
  const handleUpdateCustomer = handleUpdateContact;
  const handleDeleteCustomer = handleDeleteContact;
  const handleAddSupplier = handleAddContact;
  const handleUpdateSupplier = handleUpdateContact;
  const handleDeleteSupplier = handleDeleteContact;

  // ============================================
  // MATERIALS HANDLERS
  // ============================================
  const handleAddMaterial = async (materialData) => {
    try {
      const { data, error } = await supabase.from('materials').insert(materialData).select().single();
      if (error) throw error;
      setMaterials([...materials, data].sort((a, b) => a.name.localeCompare(b.name)));
      showToast('Material added');
    } catch (err) {
      console.error('Error adding material:', err);
      showToast('Error adding material', 'error');
    }
  };

  const handleUpdateMaterial = async (materialId, updates) => {
    try {
      const { error } = await supabase.from('materials').update(updates).eq('id', materialId);
      if (error) throw error;
      setMaterials(materials.map(m => m.id === materialId ? { ...m, ...updates } : m));
      showToast('Material updated');
    } catch (err) {
      console.error('Error updating material:', err);
      showToast('Error updating material', 'error');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    const inUse = parts.some(p => p.stock_material_id === materialId);
    if (inUse) { showToast('Cannot delete: material is in use', 'error'); return; }
    try {
      const { error } = await supabase.from('materials').update({ deleted_at: new Date().toISOString() }).eq('id', materialId);
      if (error) throw error;
      setMaterials(materials.filter(m => m.id !== materialId));
      showToast('Material deleted');
    } catch (err) {
      console.error('Error deleting material:', err);
      showToast('Error deleting material', 'error');
    }
  };

  // ============================================
  // PARTS HANDLERS
  // ============================================
  const handleAddPart = async (partData) => {
    try {
      // Build clean data object based on part type
      const cleanData = {
        part_number: partData.part_number,
        description: partData.description,
        type: partData.type,
        status: 'active',
        uom: partData.uom || 'EA',
        finished_weight: partData.finished_weight || null,
        revision_notes: partData.revision_notes || null
      };

      // Add type-specific fields
      if (partData.type === 'purchased') {
        cleanData.supplier_id = partData.supplier_id || null;
        cleanData.supplier_code = partData.supplier_code || null;
      } else if (partData.type === 'manufactured') {
        cleanData.stock_material_id = partData.stock_material_id || null;
        cleanData.stock_form = partData.stock_form || null;
        // Only include stock_dimensions if it has values
        if (partData.stock_dimensions && Object.keys(partData.stock_dimensions).length > 0) {
          cleanData.stock_dimensions = partData.stock_dimensions;
        }
      }

      const { data, error } = await supabase.from('parts').insert(cleanData).select().single();
      if (error) throw error;
      setParts([data, ...parts]);
      setShowAddPartModal(false);
      showToast(`Part ${data.part_number} created`);
    } catch (err) {
      console.error('Error adding part:', err);
      showToast('Error creating part', 'error');
    }
  };

  const handleUpdatePart = async (partId, updates) => {
    try {
      const { error } = await supabase.from('parts').update(updates).eq('id', partId);
      if (error) throw error;
      setParts(parts.map(p => p.id === partId ? { ...p, ...updates } : p));
      if (selectedPart?.id === partId) setSelectedPart({ ...selectedPart, ...updates });
      showToast('Part updated');
    } catch (err) {
      console.error('Error updating part:', err);
      showToast('Error updating part', 'error');
    }
  };

  const handleDeletePart = async (partId) => {
    try {
      const { error } = await supabase.from('parts').update({ deleted_at: new Date().toISOString() }).eq('id', partId);
      if (error) throw error;
      setParts(parts.filter(p => p.id !== partId));
      setSelectedPart(null);
      showToast('Part deleted');
    } catch (err) {
      console.error('Error deleting part:', err);
      showToast('Error deleting part', 'error');
    }
  };

  const handleIncrementRevision = async (part) => {
    const newPartNumber = PartNumberUtils.incrementRevision(part.part_number);
    if (!newPartNumber) {
      showToast('Invalid part number format', 'error');
      return;
    }

    const revisionNotes = prompt(`Increment revision from ${part.part_number} to ${newPartNumber}?\n\nEnter revision notes (e.g., "Updated main diameter", "Material change"):`, '');
    if (revisionNotes === null) {
      return; // User cancelled
    }

    try {
      // First, save the current revision to the part_revisions table
      const currentRevision = part.part_number.split('-').pop() || '00';
      const { error: revisionError } = await supabase.from('part_revisions').insert({
        part_id: part.id,
        revision_number: currentRevision,
        part_number: part.part_number,
        description: part.description,
        finished_weight: part.finished_weight,
        revision_notes: part.revision_notes || '',
        uom: part.uom,
        supplier_id: part.supplier_id,
        supplier_code: part.supplier_code,
        stock_material_id: part.stock_material_id,
        stock_form: part.stock_form,
        stock_dimensions: part.stock_dimensions,
        created_by: user.id
      });

      if (revisionError) throw revisionError;

      // Then update the part with new revision number and notes
      const { error } = await supabase.from('parts').update({
        part_number: newPartNumber,
        revision_notes: revisionNotes.trim()
      }).eq('id', part.id);

      if (error) throw error;

      // Refresh data to get the new revision in the history
      await fetchData();

      const updatedPart = { ...part, part_number: newPartNumber, revision_notes: revisionNotes.trim() };
      setSelectedPart(updatedPart);
      showToast(`Revision incremented to ${newPartNumber}`);
    } catch (err) {
      console.error('Error incrementing revision:', err);
      showToast('Error incrementing revision', 'error');
    }
  };

  // ============================================
  // BOM HANDLERS
  // ============================================
  const handleAddBomItem = async (parentId, childId, quantity, position) => {
    try {
      const { data, error } = await supabase.from('bom_relations').insert({
        parent_id: parentId,
        child_id: childId,
        quantity: quantity || 1,
        position: position || null
      }).select().single();
      if (error) throw error;
      setBomRelations([...bomRelations, data]);
      showToast('BOM item added');
    } catch (err) {
      console.error('Error adding BOM item:', err);
      showToast('Error adding BOM item', 'error');
    }
  };

  const handleRemoveBomItem = async (bomId) => {
    try {
      const { error } = await supabase.from('bom_relations').delete().eq('id', bomId);
      if (error) throw error;
      setBomRelations(bomRelations.filter(b => b.id !== bomId));
      showToast('BOM item removed');
    } catch (err) {
      console.error('Error removing BOM item:', err);
      showToast('Error removing BOM item', 'error');
    }
  };

  const handleUpdateBomItem = async (bomId, updates) => {
    try {
      const { error } = await supabase.from('bom_relations').update(updates).eq('id', bomId);
      if (error) throw error;
      setBomRelations(bomRelations.map(b => b.id === bomId ? { ...b, ...updates } : b));
      showToast('BOM item updated');
    } catch (err) {
      console.error('Error updating BOM item:', err);
      showToast('Error updating BOM item', 'error');
    }
  };

  // ============================================
  // MACHINES HANDLERS
  // ============================================
  const handleAddMachine = async (machineData) => {
    try {
      const { data, error } = await supabase.from('machines').insert(machineData).select().single();
      if (error) throw error;
      setMachines([...machines, data].sort((a, b) => a.name.localeCompare(b.name)));
      showToast('Machine added');
    } catch (err) {
      console.error('Error adding machine:', err);
      showToast('Error adding machine', 'error');
    }
  };

  const handleUpdateMachine = async (machineId, updates) => {
    try {
      const { error } = await supabase.from('machines').update(updates).eq('id', machineId);
      if (error) throw error;
      setMachines(machines.map(m => m.id === machineId ? { ...m, ...updates } : m));
      showToast('Machine updated');
    } catch (err) {
      console.error('Error updating machine:', err);
      showToast('Error updating machine', 'error');
    }
  };

  const handleDeleteMachine = async (machineId) => {
    try {
      const { error } = await supabase.from('machines').update({ deleted_at: new Date().toISOString() }).eq('id', machineId);
      if (error) throw error;
      setMachines(machines.filter(m => m.id !== machineId));
      showToast('Machine deleted');
    } catch (err) {
      console.error('Error deleting machine:', err);
      showToast('Error deleting machine', 'error');
    }
  };

  // ============================================
  // OPERATIONS HANDLERS
  // ============================================
  const handleAddOperation = async (operationData) => {
    try {
      const { data, error } = await supabase.from('operations').insert(operationData).select().single();
      if (error) throw error;
      setOperations([...operations, data]);
      showToast('Operation added');
    } catch (err) {
      console.error('Error adding operation:', err);
      showToast('Error adding operation', 'error');
    }
  };

  const handleUpdateOperation = async (opId, updates) => {
    try {
      const { error } = await supabase.from('operations').update(updates).eq('id', opId);
      if (error) throw error;
      setOperations(operations.map(op => op.id === opId ? { ...op, ...updates } : op));
      showToast('Operation updated');
    } catch (err) {
      console.error('Error updating operation:', err);
      showToast('Error updating operation', 'error');
    }
  };

  const handleDeleteOperation = async (opId) => {
    try {
      const { error } = await supabase.from('operations').update({ deleted_at: new Date().toISOString() }).eq('id', opId);
      if (error) throw error;
      setOperations(operations.filter(op => op.id !== opId));
      showToast('Operation deleted');
    } catch (err) {
      console.error('Error deleting operation:', err);
      showToast('Error deleting operation', 'error');
    }
  };

  // ============================================
  // CHECK-INS HANDLERS
  // ============================================
  const handleAddCheckin = async (checkinData) => {
    try {
      // Create the check-in
      const { data: checkin, error: checkinError } = await supabase
        .from('project_checkins')
        .insert({
          project_id: checkinData.project_id,
          checkin_date: checkinData.checkin_date,
          notes: checkinData.notes,
          created_by: user.id
        })
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Create the check-in items
      const itemsToInsert = checkinData.items.map(item => ({
        checkin_id: checkin.id,
        description: item.description,
        quantity: item.quantity
      }));

      const { data: items, error: itemsError } = await supabase
        .from('checkin_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      setCheckins([checkin, ...checkins]);
      setCheckinItems([...checkinItems, ...items]);
      showToast('Check-in added successfully');
    } catch (err) {
      console.error('Error adding check-in:', err);
      showToast('Error adding check-in', 'error');
    }
  };

  const handleDeleteCheckin = async (checkinId) => {
    try {
      const { error } = await supabase.from('project_checkins').update({ deleted_at: new Date().toISOString() }).eq('id', checkinId);
      if (error) throw error;
      setCheckins(checkins.filter(c => c.id !== checkinId));
      setCheckinItems(checkinItems.filter(item => item.checkin_id !== checkinId));
      showToast('Check-in deleted');
    } catch (err) {
      console.error('Error deleting check-in:', err);
      showToast('Error deleting check-in', 'error');
    }
  };

  // ============================================
  // DELIVERY NOTES HANDLERS
  // ============================================
  const handleAddDeliveryNote = async (deliveryNoteData) => {
    try {
      // Get the project to determine project number
      const project = projects.find(p => p.id === deliveryNoteData.project_id);
      if (!project) throw new Error('Project not found');

      // Find existing delivery notes for this project to determine next increment
      const projectDeliveryNotes = deliveryNotes.filter(dn => dn.project_id === deliveryNoteData.project_id);
      const nextIncrement = projectDeliveryNotes.length + 1;
      const deliveryNoteNumber = `DN-${project.project_number}-${nextIncrement.toString().padStart(2, '0')}`;

      // Create the delivery note
      const { data: deliveryNote, error: noteError } = await supabase
        .from('delivery_notes')
        .insert({
          project_id: deliveryNoteData.project_id,
          delivery_note_number: deliveryNoteNumber,
          delivery_date: deliveryNoteData.delivery_date,
          notes: deliveryNoteData.notes,
          created_by: user.id
        })
        .select()
        .single();

      if (noteError) throw noteError;

      // Create the delivery note items
      const itemsToInsert = deliveryNoteData.items.map(item => ({
        delivery_note_id: deliveryNote.id,
        description: item.description,
        quantity: item.quantity,
        part_id: item.part_id || null
      }));

      const { data: items, error: itemsError } = await supabase
        .from('delivery_note_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      setDeliveryNotes([deliveryNote, ...deliveryNotes]);
      setDeliveryNoteItems([...deliveryNoteItems, ...items]);
      showToast('Delivery note created successfully');
    } catch (err) {
      console.error('Error adding delivery note:', err);
      showToast('Error adding delivery note', 'error');
    }
  };

  const handleDeleteDeliveryNote = async (deliveryNoteId) => {
    try {
      const { error } = await supabase.from('delivery_notes').update({ deleted_at: new Date().toISOString() }).eq('id', deliveryNoteId);
      if (error) throw error;
      setDeliveryNotes(deliveryNotes.filter(dn => dn.id !== deliveryNoteId));
      setDeliveryNoteItems(deliveryNoteItems.filter(item => item.delivery_note_id !== deliveryNoteId));
      showToast('Delivery note deleted');
    } catch (err) {
      console.error('Error deleting delivery note:', err);
      showToast('Error deleting delivery note', 'error');
    }
  };

  if (loading) {
    return (<div className="loading-container"><div className="spinner"></div><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>);
  }

  const stats = {
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgressValue: projects.filter(p => p.status === 'in-progress').reduce((sum, p) => sum + parseFloat(p.value || 0), 0)
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <div className={`sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`} onClick={() => setMobileMenuOpen(false)} />
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}><Icons.Menu /></button>
            <div className="logo">
              <div className="logo-icon">ERP</div>
              <div>
                <div className="logo-text">Workshop ERP</div>
                <div className="logo-subtitle">Engineering Management System</div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat"><div className="stat-value">{stats.inProgress}</div><div className="stat-label">Active Projects</div></div>
              <div className="stat"><div className="stat-value">£{stats.inProgressValue.toLocaleString()}</div><div className="stat-label">In Progress Value</div></div>
            </div>
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
              <button className="logout-btn" onClick={onLogout} title="Sign out"><Icons.LogOut /></button>
            </div>
          </div>
        </header>
        <div className="main-content">
          <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <button className="sidebar-close-btn" onClick={() => setMobileMenuOpen(false)}><Icons.X /></button>
            <div className="nav-section">
              <div className="nav-section-title">Projects</div>
              <div className={`nav-item ${activeView === 'projects' ? 'active' : ''}`} onClick={() => { setActiveView('projects'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Briefcase /><span>All Projects</span></div>
              <div className={`nav-item ${activeView === 'contacts' ? 'active' : ''}`} onClick={() => { setActiveView('contacts'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Users /><span>Contacts</span></div>
            </div>
            <div className="nav-section">
              <div className="nav-section-title">Parts Management</div>
              <div className={`nav-item ${activeView === 'parts' ? 'active' : ''}`} onClick={() => { setActiveView('parts'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Package /><span>Parts</span></div>
              <div className={`nav-item ${activeView === 'bom-explorer' ? 'active' : ''}`} onClick={() => { setActiveView('bom-explorer'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.List /><span>BOM Explorer</span></div>
              <div className={`nav-item ${activeView === 'order-materials' ? 'active' : ''}`} onClick={() => { setActiveView('order-materials'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.ShoppingCart /><span>Order Materials</span></div>
              <div className={`nav-item ${activeView === 'materials' ? 'active' : ''}`} onClick={() => { setActiveView('materials'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Layers /><span>Materials</span></div>
              <div className={`nav-item ${activeView === 'machines' ? 'active' : ''}`} onClick={() => { setActiveView('machines'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Settings /><span>Machines</span></div>
            </div>
          </nav>
          <main className="content-area">
            {activeView === 'projects' && !selectedProject && (<ProjectsView projects={projects} customers={customers} getCustomer={getCustomer} onSelectProject={setSelectedProject} onAddProject={() => setShowAddProjectModal(true)} />)}
            {activeView === 'projects' && selectedProject && (<ProjectDetailView project={selectedProject} customer={getCustomer(selectedProject.customer_id)} customers={customers} checkins={checkins} checkinItems={checkinItems} deliveryNotes={deliveryNotes} deliveryNoteItems={deliveryNoteItems} parts={parts} onBack={() => setSelectedProject(null)} onUpdateProject={handleUpdateProject} onAddNote={handleAddNote} onDeleteProject={handleDeleteProject} onAddCheckin={handleAddCheckin} onDeleteCheckin={handleDeleteCheckin} onAddDeliveryNote={handleAddDeliveryNote} onDeleteDeliveryNote={handleDeleteDeliveryNote} />)}
            {activeView === 'contacts' && (<ContactsView contacts={contacts} projects={projects} parts={parts} onAddContact={handleAddContact} onUpdateContact={handleUpdateContact} onDeleteContact={handleDeleteContact} />)}
            {activeView === 'materials' && (<MaterialsView materials={materials} parts={parts} onAddMaterial={handleAddMaterial} onUpdateMaterial={handleUpdateMaterial} onDeleteMaterial={handleDeleteMaterial} />)}
            {activeView === 'machines' && (<MachinesView machines={machines} onAddMachine={handleAddMachine} onUpdateMachine={handleUpdateMachine} onDeleteMachine={handleDeleteMachine} />)}
            {activeView === 'parts' && !selectedPart && (<PartsView parts={parts} suppliers={suppliers} materials={materials} onSelectPart={setSelectedPart} onAddPart={() => setShowAddPartModal(true)} />)}
            {activeView === 'parts' && selectedPart && (<PartDetailView part={selectedPart} parts={parts} suppliers={suppliers} materials={materials} machines={machines} bomRelations={bomRelations} operations={operations} partRevisions={partRevisions} onBack={() => setSelectedPart(null)} onUpdatePart={handleUpdatePart} onDeletePart={handleDeletePart} onIncrementRevision={handleIncrementRevision} onAddBomItem={handleAddBomItem} onRemoveBomItem={handleRemoveBomItem} onUpdateBomItem={handleUpdateBomItem} onAddOperation={handleAddOperation} onUpdateOperation={handleUpdateOperation} onDeleteOperation={handleDeleteOperation} />)}
            {activeView === 'bom-explorer' && (<BOMExplorerView parts={parts} suppliers={suppliers} materials={materials} bomRelations={bomRelations} />)}
            {activeView === 'order-materials' && (<OrderMaterialsView parts={parts} materials={materials} />)}
          </main>
        </div>
        {showAddProjectModal && (<AddProjectModal customers={customers} nextProjectNumber={getNextProjectNumber()} onClose={() => setShowAddProjectModal(false)} onSave={handleAddProject} />)}
        {showAddPartModal && (<AddPartModal suppliers={suppliers} materials={materials} parts={parts} onClose={() => setShowAddPartModal(false)} onSave={handleAddPart} />)}
        {toast && (<div className={`toast ${toast.type}`}>{toast.type === 'success' ? <Icons.Check /> : <Icons.X />}<span>{toast.message}</span></div>)}
      </div>
    </>
  );
}

// ============================================
// BOM EXPLORER VIEW
// ============================================
function BOMExplorerView({ parts, suppliers, materials, bomRelations }) {
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [expandedParts, setExpandedParts] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const assemblies = parts.filter(p => p.type === 'assembly').sort((a, b) => a.part_number.localeCompare(b.part_number));

  const toggleExpand = (partId) => {
    if (expandedParts.includes(partId)) {
      setExpandedParts(expandedParts.filter(id => id !== partId));
    } else {
      setExpandedParts([...expandedParts, partId]);
    }
  };

  const getPartDetails = (partId) => parts.find(p => p.id === partId);

  const getBomItems = (partId) => {
    return bomRelations
      .filter(bom => bom.parent_id === partId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const renderBOMTree = (partId, level = 0, quantity = 1, path = []) => {
    const part = getPartDetails(partId);
    if (!part) return null;

    // Prevent circular references
    if (path.includes(partId)) {
      return (
        <div key={`${partId}-${level}`} style={{ paddingLeft: level * 24, padding: '8px 12px', background: 'var(--bg-tertiary)', borderLeft: '2px solid #ef4444', marginBottom: 4 }}>
          <span style={{ color: '#ef4444', fontSize: 12 }}>⚠️ Circular reference detected</span>
        </div>
      );
    }

    const bomItems = getBomItems(partId);
    const isAssembly = part.type === 'assembly' && bomItems.length > 0;
    const isExpanded = expandedParts.includes(partId);
    const supplier = suppliers.find(s => s.id === part.supplier_id);
    const material = materials.find(m => m.id === part.stock_material_id);

    return (
      <div key={`${partId}-${level}`} style={{ marginBottom: 4 }}>
        <div
          style={{
            paddingLeft: level * 24,
            padding: '8px 12px',
            background: level === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            cursor: isAssembly ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
          onClick={() => isAssembly && toggleExpand(partId)}
        >
          {isAssembly && (
            <span style={{ fontSize: 12, width: 16 }}>{isExpanded ? '▼' : '▶'}</span>
          )}
          {!isAssembly && <span style={{ width: 16 }}></span>}

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '150px 1fr 100px 120px 80px', gap: 16, alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>{part.part_number}</span>
            <span style={{ fontSize: 13 }}>{part.description}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {part.type === 'purchased' ? 'Purchased' : part.type === 'manufactured' ? 'Manufactured' : 'Assembly'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {part.type === 'purchased' && supplier ? supplier.name : ''}
              {part.type === 'manufactured' && material ? material.name : ''}
            </span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Qty: {quantity}</span>
          </div>
        </div>

        {isAssembly && isExpanded && (
          <div style={{ marginTop: 4 }}>
            {bomItems.map(bomItem => {
              const childPart = getPartDetails(bomItem.child_id);
              return childPart ? renderBOMTree(bomItem.child_id, level + 1, bomItem.quantity, [...path, partId]) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  // Flatten BOM for print
  const flattenBOM = (partId, quantity = 1, level = 0, path = []) => {
    const part = getPartDetails(partId);
    if (!part || path.includes(partId)) return [];

    const items = [{
      level,
      part_number: part.part_number,
      description: part.description,
      type: part.type,
      quantity,
      supplier: part.type === 'purchased' ? suppliers.find(s => s.id === part.supplier_id)?.name : '',
      material: part.type === 'manufactured' ? materials.find(m => m.id === part.stock_material_id)?.name : ''
    }];

    const bomItems = getBomItems(partId);
    bomItems.forEach(bomItem => {
      items.push(...flattenBOM(bomItem.child_id, bomItem.quantity * quantity, level + 1, [...path, partId]));
    });

    return items;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">BOM Explorer</h1>
          <p className="page-subtitle">Explore assembly bill of materials</p>
        </div>
        {selectedAssembly && (
          <button className="btn btn-secondary" onClick={() => setShowPrintPreview(true)}>
            <Icons.Printer /> Print BOM
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <label className="form-label">Select Assembly</label>
        <select
          className="form-select"
          value={selectedAssembly?.id || ''}
          onChange={(e) => {
            const assembly = assemblies.find(a => a.id === e.target.value);
            setSelectedAssembly(assembly || null);
            setExpandedParts(assembly ? [assembly.id] : []);
          }}
        >
          <option value="">Choose an assembly...</option>
          {assemblies.map(assembly => (
            <option key={assembly.id} value={assembly.id}>
              {assembly.part_number} - {assembly.description}
            </option>
          ))}
        </select>
      </div>

      {selectedAssembly ? (
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {selectedAssembly.part_number}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {selectedAssembly.description}
            </p>
          </div>

          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6, display: 'grid', gridTemplateColumns: '150px 1fr 100px 120px 80px', gap: 16, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            <span>Part Number</span>
            <span>Description</span>
            <span>Type</span>
            <span>Supplier/Material</span>
            <span>Quantity</span>
          </div>

          {renderBOMTree(selectedAssembly.id)}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Select an assembly to view its bill of materials
        </div>
      )}

      {showPrintPreview && selectedAssembly && (
        <div className="print-preview-modal" onClick={() => setShowPrintPreview(false)}>
          <div className="print-preview-content" onClick={e => e.stopPropagation()}>
            <div className="print-preview-toolbar">
              <h3>Print Bill of Materials</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => window.print()}><Icons.Printer /> Print</button>
                <button className="btn btn-secondary" onClick={() => setShowPrintPreview(false)}>Close</button>
              </div>
            </div>
            <div className="print-preview-body">
              <div className="print-header">
                <h1>Bill of Materials</h1>
                <p>{selectedAssembly.part_number} - {selectedAssembly.description}</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <table className="print-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>Level</th>
                    <th style={{ width: 120 }}>Part Number</th>
                    <th>Description</th>
                    <th style={{ width: 80 }}>Type</th>
                    <th style={{ width: 120 }}>Supplier/Material</th>
                    <th style={{ width: 60 }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {flattenBOM(selectedAssembly.id).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center' }}>{item.level}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.part_number}</td>
                      <td>{item.description}</td>
                      <td style={{ fontSize: 11, textTransform: 'capitalize' }}>{item.type}</td>
                      <td style={{ fontSize: 11 }}>{item.supplier || item.material || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// ORDER MATERIALS VIEW
// ============================================
function OrderMaterialsView({ parts, materials }) {
  const [selectedParts, setSelectedParts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Only show manufactured parts (they have stock materials)
  const manufacturedParts = parts.filter(p => p.type === 'manufactured' && p.status === 'active');

  // Filter parts based on search
  const filteredParts = manufacturedParts.filter(part => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      part.part_number.toLowerCase().includes(query) ||
      part.description.toLowerCase().includes(query)
    );
  });

  const togglePart = (partId) => {
    if (selectedParts[partId]) {
      const newSelected = { ...selectedParts };
      delete newSelected[partId];
      setSelectedParts(newSelected);
    } else {
      setSelectedParts({ ...selectedParts, [partId]: 1 });
    }
  };

  const updateQuantity = (partId, quantity) => {
    setSelectedParts({ ...selectedParts, [partId]: Math.max(1, parseInt(quantity) || 1) });
  };

  // Calculate material requirements
  const calculateMaterialRequirements = () => {
    const requirements = {};

    Object.entries(selectedParts).forEach(([partId, quantity]) => {
      const part = parts.find(p => p.id === partId);
      if (!part || !part.stock_material_id || !part.stock_dimensions) return;

      const material = materials.find(m => m.id === part.stock_material_id);
      if (!material) return;

      const key = `${material.id}_${part.stock_form}`;

      if (!requirements[key]) {
        requirements[key] = {
          material,
          stockForm: part.stock_form,
          items: []
        };
      }

      requirements[key].items.push({
        part,
        quantity,
        dimensions: part.stock_dimensions
      });
    });

    return Object.values(requirements);
  };

  const materialRequirements = calculateMaterialRequirements();

  // Generate email content
  const generateEmail = () => {
    let emailContent = `Dear Supplier,\n\nI would like to request a quote for the following stock materials:\n\n`;

    materialRequirements.forEach((req, idx) => {
      emailContent += `${idx + 1}. ${req.material.name} - ${req.stockForm.replace('_', ' ').toUpperCase()}\n\n`;

      req.items.forEach(item => {
        const dims = item.dimensions;
        let dimStr = '';

        if (item.part.stock_form === 'round_bar') {
          dimStr = `Ø${dims.diameter}mm × ${dims.length}mm`;
        } else if (item.part.stock_form === 'flat_bar') {
          dimStr = `${dims.width}mm × ${dims.thickness}mm × ${dims.length}mm`;
        } else if (item.part.stock_form === 'plate') {
          dimStr = `${dims.width}mm × ${dims.length}mm × ${dims.thickness}mm`;
        } else if (item.part.stock_form === 'hex_bar') {
          dimStr = `${dims.across_flats}mm A/F × ${dims.length}mm`;
        } else if (item.part.stock_form === 'tube') {
          dimStr = `OD${dims.outer_diameter}mm × WT${dims.wall_thickness}mm × ${dims.length}mm`;
        }

        const weight = StockCalculations.calculateWeight(item.part.stock_form, dims, req.material.density);

        emailContent += `   - ${item.part.part_number}: ${dimStr} × ${item.quantity} pcs (${(weight * item.quantity).toFixed(2)} kg total)\n`;
      });

      emailContent += `\n`;
    });

    emailContent += `\nPlease provide pricing and lead time for the above materials.\n\nBest regards`;

    return emailContent;
  };

  const selectedCount = Object.keys(selectedParts).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Materials</h1>
          <p className="page-subtitle">Select parts and generate material order quote request</p>
        </div>
        {selectedCount > 0 && (
          <button className="btn btn-primary" onClick={() => setShowEmailPreview(true)}>
            <Icons.Mail /> Generate Quote Request ({selectedCount} part{selectedCount !== 1 ? 's' : ''})
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="card" style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search by part number or description..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ fontSize: 14 }}
        />
      </div>

      {/* Parts Selection */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Select Parts to Manufacture</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {filteredParts.length} manufactured parts available
          </div>
        </div>

        {filteredParts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredParts.map(part => {
              const material = materials.find(m => m.id === part.stock_material_id);
              const isSelected = !!selectedParts[part.id];

              return (
                <div
                  key={part.id}
                  className="card"
                  style={{
                    padding: 12,
                    background: isSelected ? 'rgba(59,130,246,0.1)' : 'var(--bg-tertiary)',
                    border: isSelected ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => togglePart(part.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-orange)' }}>
                          {part.part_number}
                        </span>
                        <span style={{ fontSize: 13 }}>{part.description}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {material?.name || 'No material'} • {part.stock_form ? part.stock_form.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No form'}
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={selectedParts[part.id]}
                          onChange={e => updateQuantity(part.id, e.target.value)}
                          className="form-input"
                          style={{ width: 80, padding: '4px 8px', fontSize: 13 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            {searchQuery ? 'No parts match your search' : 'No manufactured parts available'}
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="print-preview-modal" onClick={() => setShowEmailPreview(false)}>
          <div className="print-preview-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="print-preview-toolbar">
              <h3>Material Quote Request</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(generateEmail());
                    alert('Email content copied to clipboard!');
                  }}
                >
                  <Icons.Copy /> Copy to Clipboard
                </button>
                <button className="btn btn-secondary" onClick={() => setShowEmailPreview(false)}>Close</button>
              </div>
            </div>
            <div className="label-preview-body">
              <div style={{ background: 'white', color: 'black', padding: 40 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Material Quote Request</h2>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 600 }}>MATERIAL</th>
                      <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 600 }}>PART</th>
                      <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 600 }}>DIMENSIONS</th>
                      <th style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, fontWeight: 600 }}>QTY</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 11, fontWeight: 600 }}>WEIGHT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialRequirements.map((req, reqIdx) => (
                      <React.Fragment key={reqIdx}>
                        {req.items.map((item, itemIdx) => {
                          const dims = item.dimensions;
                          let dimStr = '';

                          if (item.part.stock_form === 'round_bar') {
                            dimStr = `Ø${dims.diameter}mm × ${dims.length}mm`;
                          } else if (item.part.stock_form === 'flat_bar') {
                            dimStr = `${dims.width}mm × ${dims.thickness}mm × ${dims.length}mm`;
                          } else if (item.part.stock_form === 'plate') {
                            dimStr = `${dims.width}mm × ${dims.length}mm × ${dims.thickness}mm`;
                          } else if (item.part.stock_form === 'hex_bar') {
                            dimStr = `${dims.across_flats}mm A/F × ${dims.length}mm`;
                          } else if (item.part.stock_form === 'tube') {
                            dimStr = `OD${dims.outer_diameter}mm × WT${dims.wall_thickness}mm × ${dims.length}mm`;
                          }

                          const weight = StockCalculations.calculateWeight(item.part.stock_form, dims, req.material.density);

                          return (
                            <tr key={`${reqIdx}-${itemIdx}`} style={{ borderBottom: '1px solid #ddd' }}>
                              {itemIdx === 0 && (
                                <td
                                  rowSpan={req.items.length}
                                  style={{ padding: '12px 8px 12px 0', fontSize: 13, fontWeight: 600, verticalAlign: 'top' }}
                                >
                                  {req.material.name}<br/>
                                  <span style={{ fontSize: 11, fontWeight: 400, color: '#666' }}>
                                    {req.stockForm.replace('_', ' ').toUpperCase()}
                                  </span>
                                </td>
                              )}
                              <td style={{ padding: '12px 0', fontSize: 12, fontFamily: 'monospace' }}>{item.part.part_number}</td>
                              <td style={{ padding: '12px 0', fontSize: 12 }}>{dimStr}</td>
                              <td style={{ padding: '12px 0', fontSize: 12, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                              <td style={{ padding: '12px 0', fontSize: 12, textAlign: 'right' }}>{(weight * item.quantity).toFixed(2)} kg</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>EMAIL TEMPLATE (Plain Text)</div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, fontFamily: 'monospace', margin: 0 }}>
                    {generateEmail()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// PROJECTS VIEW
// ============================================
function ProjectsView({ projects, customers, getCustomer, onSelectProject, onAddProject }) {
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

// ADD CHECK-IN MODAL
// ============================================
function AddCheckinModal({ projectId, onClose, onSave }) {
  const [checkinDate, setCheckinDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1 }]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = () => {
    // Validate
    const validItems = items.filter(item => item.description.trim());
    if (validItems.length === 0) {
      alert('Please add at least one item with a description');
      return;
    }

    onSave({
      project_id: projectId,
      checkin_date: checkinDate,
      notes: notes.trim(),
      items: validItems
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title"><Icons.Package /> New Parts Check-in</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Check-in Date *</label>
            <input
              type="date"
              className="form-input"
              value={checkinDate}
              onChange={e => setCheckinDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Optional notes about this check-in..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Items *</label>
              <button className="btn btn-sm btn-secondary" onClick={addItem}>
                <Icons.Plus /> Add Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Part description"
                      value={item.description}
                      onChange={e => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    style={{ opacity: items.length === 1 ? 0.3 : 1 }}
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Icons.Check /> Save Check-in
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ADD DELIVERY NOTE MODAL
// ============================================
function AddDeliveryNoteModal({ projectId, parts, checkinItems, onClose, onSave }) {
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, part_id: null, source: 'custom' }]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, part_id: null, source: 'custom' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If selecting a part or checkin item, auto-fill the description
    if (field === 'source') {
      if (value === 'custom') {
        newItems[index].description = '';
        newItems[index].part_id = null;
      }
    } else if (field === 'part_id') {
      if (value) {
        const selectedPart = parts.find(p => p.id === value);
        if (selectedPart) {
          newItems[index].description = `${selectedPart.part_number} - ${selectedPart.name}`;
        }
      }
    } else if (field === 'checkin_item_id') {
      if (value) {
        const selectedItem = checkinItems.find(ci => ci.id === value);
        if (selectedItem) {
          newItems[index].description = selectedItem.description;
          newItems[index].quantity = selectedItem.quantity;
        }
      }
    }

    setItems(newItems);
  };

  const handleSubmit = () => {
    // Validate
    const validItems = items.filter(item => item.description.trim());
    if (validItems.length === 0) {
      alert('Please add at least one item with a description');
      return;
    }

    onSave({
      project_id: projectId,
      delivery_date: deliveryDate,
      notes: notes.trim(),
      items: validItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        part_id: item.part_id
      }))
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <h2 className="modal-title"><Icons.FileText /> New Delivery Note</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Delivery Date *</label>
            <input
              type="date"
              className="form-input"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Optional notes about this delivery..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Items *</label>
              <button className="btn btn-sm btn-secondary" onClick={addItem}>
                <Icons.Plus /> Add Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, index) => (
                <div key={index} className="card" style={{ padding: 12, background: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 12 }}>Source</label>
                      <select
                        className="form-input"
                        value={item.source}
                        onChange={e => updateItem(index, 'source', e.target.value)}
                      >
                        <option value="custom">Custom Entry</option>
                        <option value="part">From Parts List</option>
                        <option value="checkin">From Check-in Items</option>
                      </select>
                    </div>

                    {item.source === 'part' && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 12 }}>Select Part</label>
                        <select
                          className="form-input"
                          value={item.part_id || ''}
                          onChange={e => updateItem(index, 'part_id', e.target.value || null)}
                        >
                          <option value="">-- Select a part --</option>
                          {parts.map(part => (
                            <option key={part.id} value={part.id}>
                              {part.part_number} - {part.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {item.source === 'checkin' && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 12 }}>Select Check-in Item</label>
                        <select
                          className="form-input"
                          onChange={e => updateItem(index, 'checkin_item_id', e.target.value || null)}
                        >
                          <option value="">-- Select an item --</option>
                          {checkinItems.map(ci => (
                            <option key={ci.id} value={ci.id}>
                              {ci.description} (Qty: {ci.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'end' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 12 }}>Description</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Item description"
                          value={item.description}
                          onChange={e => updateItem(index, 'description', e.target.value)}
                          disabled={item.source === 'part' && !item.part_id}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 12 }}>Quantity</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          step="0.01"
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                        />
                      </div>
                      <button
                        className="btn btn-ghost"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        style={{ opacity: items.length === 1 ? 0.3 : 1 }}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Icons.Check /> Save Delivery Note
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONTACTS VIEW (Unified Customers & Suppliers)
// ============================================
function ContactsView({ contacts, projects, parts, onAddContact, onUpdateContact, onDeleteContact }) {
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'customers', 'suppliers'
  const [searchQuery, setSearchQuery] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    is_customer: true,
    is_supplier: false
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Filter contacts by role
  const filteredContacts = contacts.filter(contact => {
    const matchesRole = roleFilter === 'all' ||
                       (roleFilter === 'customers' && contact.is_customer) ||
                       (roleFilter === 'suppliers' && contact.is_supplier);
    const matchesSearch = !searchQuery ||
                         contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (contact.contact && contact.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Calculate stats
  const stats = {
    total: contacts.length,
    customers: contacts.filter(c => c.is_customer).length,
    suppliers: contacts.filter(c => c.is_supplier).length,
    both: contacts.filter(c => c.is_customer && c.is_supplier).length
  };

  const handleAdd = () => {
    if (!newContact.name) return;
    if (!newContact.is_customer && !newContact.is_supplier) {
      alert('Contact must be marked as either Customer or Supplier (or both)');
      return;
    }
    onAddContact(newContact);
    setNewContact({ name: '', contact: '', email: '', phone: '', address: '', is_customer: true, is_supplier: false });
  };

  const startEdit = (contact) => {
    setEditingId(contact.id);
    setEditData({ ...contact });
  };

  const saveEdit = () => {
    if (!editData.is_customer && !editData.is_supplier) {
      alert('Contact must be marked as either Customer or Supplier (or both)');
      return;
    }
    onUpdateContact(editingId, editData);
    setEditingId(null);
  };

  const getProjectCount = (contactId) => projects.filter(p => p.customer_id === contactId).length;
  const getActiveProjectCount = (contactId) => projects.filter(p => p.customer_id === contactId && p.status !== 'completed').length;
  const getTotalValue = (contactId) => projects.filter(p => p.customer_id === contactId).reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
  const getPartCount = (contactId) => parts.filter(p => p.supplier_id === contactId).length;

  const getRoleBadge = (contact) => {
    if (contact.is_customer && contact.is_supplier) {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>Customer</span>
          <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', color: 'var(--accent-orange)' }}>Supplier</span>
        </div>
      );
    } else if (contact.is_customer) {
      return <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>Customer</span>;
    } else {
      return <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', color: 'var(--accent-orange)' }}>Supplier</span>;
    }
  };

  const getSyncStatusBadge = (contact) => {
    if (contact.sync_status === 'synced') {
      return <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '8px', background: 'rgba(52,211,153,0.15)', color: 'var(--accent-green)' }} title="Synced with Xero">Xero</span>;
    } else if (contact.sync_status === 'pending_push') {
      return <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '8px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }} title="Pending sync to Xero">Pending</span>;
    }
    return null; // local_only doesn't show badge
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage customers, suppliers, and Xero integration</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.customers}</div>
          <div className="stat-card-label">Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--accent-orange)' }}>{stats.suppliers}</div>
          <div className="stat-card-label">Suppliers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{stats.both}</div>
          <div className="stat-card-label">Both Roles</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-box">
        <Icons.Search />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-row" style={{ marginBottom: 24 }}>
        <button
          className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
          onClick={() => setRoleFilter('all')}
        >
          All<span className="count">{stats.total}</span>
        </button>
        <button
          className={`filter-btn ${roleFilter === 'customers' ? 'active' : ''}`}
          onClick={() => setRoleFilter('customers')}
        >
          Customers<span className="count">{stats.customers}</span>
        </button>
        <button
          className={`filter-btn ${roleFilter === 'suppliers' ? 'active' : ''}`}
          onClick={() => setRoleFilter('suppliers')}
        >
          Suppliers<span className="count">{stats.suppliers}</span>
        </button>
      </div>

      {/* Add Contact Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Add New Contact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Company name"
              value={newContact.name}
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              className="form-input"
              placeholder="Name"
              value={newContact.contact}
              onChange={e => setNewContact({ ...newContact, contact: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="email@company.com"
              value={newContact.email}
              onChange={e => setNewContact({ ...newContact, email: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-input"
              placeholder="Phone number"
              value={newContact.phone}
              onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Business address"
              value={newContact.address}
              onChange={e => setNewContact({ ...newContact, address: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={newContact.is_customer}
              onChange={e => setNewContact({ ...newContact, is_customer: e.target.checked })}
            />
            <span>Customer</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={newContact.is_supplier}
              onChange={e => setNewContact({ ...newContact, is_supplier: e.target.checked })}
            />
            <span>Supplier</span>
          </label>
          <button className="btn btn-primary" onClick={handleAdd} style={{ marginLeft: 'auto' }}>
            <Icons.Plus /> Add Contact
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role(s)</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Usage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => {
              const projectCount = getProjectCount(contact.id);
              const activeCount = getActiveProjectCount(contact.id);
              const totalValue = getTotalValue(contact.id);
              const partCount = getPartCount(contact.id);
              const isEditing = editingId === contact.id;

              if (isEditing) {
                return (
                  <tr key={contact.id}>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={editData.is_customer}
                            onChange={e => setEditData({ ...editData, is_customer: e.target.checked })}
                          />
                          Customer
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={editData.is_supplier}
                            onChange={e => setEditData({ ...editData, is_supplier: e.target.checked })}
                          />
                          Supplier
                        </label>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={editData.contact || ''}
                        onChange={e => setEditData({ ...editData, contact: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        className="form-input"
                        value={editData.email || ''}
                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={editData.phone || ''}
                        onChange={e => setEditData({ ...editData, phone: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      {contact.is_customer && <div>{projectCount} projects</div>}
                      {contact.is_supplier && <div>{partCount} parts</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost"
                          onClick={saveEdit}
                          style={{ color: 'var(--accent-green)' }}
                        >
                          <Icons.Check />
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <Icons.X />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={contact.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <strong>{contact.name}</strong>
                      {getSyncStatusBadge(contact)}
                    </div>
                  </td>
                  <td>{getRoleBadge(contact)}</td>
                  <td>{contact.contact || '-'}</td>
                  <td>
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} style={{ color: 'var(--accent-blue)' }}>
                        {contact.email}
                      </a>
                    ) : '-'}
                  </td>
                  <td>{contact.phone || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13 }}>
                      {contact.is_customer && (
                        <div>
                          {projectCount} project{projectCount !== 1 ? 's' : ''}
                          {activeCount > 0 && (
                            <span style={{ color: 'var(--accent-orange)', marginLeft: 4 }}>
                              ({activeCount} active)
                            </span>
                          )}
                          {totalValue > 0 && (
                            <div style={{ fontFamily: 'monospace', color: 'var(--accent-green)', fontSize: 12 }}>
                              £{totalValue.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                      {contact.is_supplier && (
                        <div>{partCount} part{partCount !== 1 ? 's' : ''}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-ghost"
                        onClick={() => startEdit(contact)}
                      >
                        <Icons.Pencil />
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => onDeleteContact(contact.id)}
                        disabled={(contact.is_customer && projectCount > 0) || (contact.is_supplier && partCount > 0)}
                        style={{ opacity: ((contact.is_customer && projectCount > 0) || (contact.is_supplier && partCount > 0)) ? 0.3 : 1 }}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredContacts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          No contacts found
        </div>
      )}
    </>
  );
}

// ============================================
// MATERIALS VIEW
// ============================================
function MaterialsView({ materials, parts, onAddMaterial, onUpdateMaterial, onDeleteMaterial }) {
  const [newMaterial, setNewMaterial] = useState({ name: '', density: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newMaterial.name || !newMaterial.density) return;
    onAddMaterial(newMaterial);
    setNewMaterial({ name: '', density: '' });
  };
  const startEdit = (material) => { setEditingId(material.id); setEditData({ ...material }); };
  const saveEdit = () => { onUpdateMaterial(editingId, editData); setEditingId(null); };

  const getPartCount = (materialId) => parts.filter(p => p.stock_material_id === materialId).length;

  return (
    <>
      <div className="page-header"><div><h1 className="page-title">Materials</h1><p className="page-subtitle">Manage material types and properties</p></div></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Material Name *</label><input type="text" className="form-input" placeholder="e.g., Aluminium 6082-T6" value={newMaterial.name} onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Density (kg/m³) *</label><input type="number" className="form-input" placeholder="e.g., 2700" value={newMaterial.density} onChange={e => setNewMaterial({ ...newMaterial, density: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={handleAdd}><Icons.Plus /> Add Material</button>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Material Name</th><th>Density (kg/m³)</th><th>Parts Using</th><th></th></tr></thead>
          <tbody>
            {materials.map(material => {
              const partCount = getPartCount(material.id);
              const isEditing = editingId === material.id;
              if (isEditing) {
                return (<tr key={material.id}><td><input type="text" className="form-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="number" className="form-input" value={editData.density} onChange={e => setEditData({ ...editData, density: e.target.value })} style={{ padding: '6px 10px' }} /></td><td>{partCount}</td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={saveEdit} style={{ color: 'var(--accent-green)' }}><Icons.Check /></button><button className="btn btn-ghost" onClick={() => setEditingId(null)}><Icons.X /></button></div></td></tr>);
              }
              return (<tr key={material.id}><td><strong>{material.name}</strong></td><td>{parseFloat(material.density).toLocaleString()}</td><td>{partCount}</td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={() => startEdit(material)}><Icons.Pencil /></button><button className="btn btn-ghost" onClick={() => onDeleteMaterial(material.id)} disabled={partCount > 0} style={{ opacity: partCount > 0 ? 0.3 : 1 }}><Icons.Trash /></button></div></td></tr>);
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ============================================
// MACHINES VIEW
// ============================================
function MachinesView({ machines, onAddMachine, onUpdateMachine, onDeleteMachine }) {
  const [newMachine, setNewMachine] = useState({ name: '', type: 'mill' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newMachine.name) return;
    onAddMachine(newMachine);
    setNewMachine({ name: '', type: 'mill' });
  };
  const startEdit = (machine) => { setEditingId(machine.id); setEditData({ ...machine }); };
  const saveEdit = () => { onUpdateMachine(editingId, editData); setEditingId(null); };

  const machineTypes = [
    { value: 'mill', label: 'Mill' },
    { value: 'lathe', label: 'Lathe' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <>
      <div className="page-header"><div><h1 className="page-title">Machines</h1><p className="page-subtitle">Manage workshop machines</p></div></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Machine Name *</label><input type="text" className="form-input" placeholder="e.g., Haas VF3" value={newMachine.name} onChange={e => setNewMachine({ ...newMachine, name: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Type *</label>
            <select className="form-select" value={newMachine.type} onChange={e => setNewMachine({ ...newMachine, type: e.target.value })}>
              {machineTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}><Icons.Plus /> Add Machine</button>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Machine Name</th><th>Type</th><th></th></tr></thead>
          <tbody>
            {machines.map(machine => {
              const isEditing = editingId === machine.id;
              if (isEditing) {
                return (<tr key={machine.id}><td><input type="text" className="form-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><select className="form-select" value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })} style={{ padding: '6px 10px' }}>{machineTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}</select></td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={saveEdit} style={{ color: 'var(--accent-green)' }}><Icons.Check /></button><button className="btn btn-ghost" onClick={() => setEditingId(null)}><Icons.X /></button></div></td></tr>);
              }
              return (<tr key={machine.id}><td><strong>{machine.name}</strong></td><td><span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{machine.type}</span></td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={() => startEdit(machine)}><Icons.Pencil /></button><button className="btn btn-ghost" onClick={() => { if (confirm('Delete this machine?')) onDeleteMachine(machine.id); }}><Icons.Trash /></button></div></td></tr>);
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ============================================
// PARTS VIEW
// ============================================
function PartsView({ parts, suppliers, materials, onSelectPart, onAddPart }) {
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParts = parts.filter(part => {
    const matchesType = !typeFilter || part.type === typeFilter;
    const matchesStatus = !statusFilter || part.status === statusFilter;
    const matchesSearch = !searchQuery ||
      part.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    total: parts.length,
    manufactured: parts.filter(p => p.type === 'manufactured' && p.status === 'active').length,
    purchased: parts.filter(p => p.type === 'purchased' && p.status === 'active').length,
    assembly: parts.filter(p => p.type === 'assembly' && p.status === 'active').length,
    active: parts.filter(p => p.status === 'active').length,
  };

  const getSupplier = (supplierId) => suppliers.find(s => s.id === supplierId);
  const getMaterial = (materialId) => materials.find(m => m.id === materialId);

  const getPartTypeLabel = (type) => {
    const labels = { manufactured: 'Manufactured', purchased: 'Purchased', assembly: 'Assembly' };
    return labels[type] || type;
  };

  const getPartTypeBadgeColor = (type) => {
    const colors = {
      manufactured: 'var(--accent-blue)',
      purchased: 'var(--accent-orange)',
      assembly: 'var(--accent-green)'
    };
    return colors[type] || 'var(--text-muted)';
  };

  return (
    <>
      <div className="page-header">
        <div><h1 className="page-title">Parts</h1><p className="page-subtitle">Manage manufactured, purchased, and assembly parts</p></div>
        <button className="btn btn-primary" onClick={onAddPart}><Icons.Plus /> New Part</button>
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-card-value">{stats.manufactured}</div><div className="stat-card-label">Manufactured</div></div>
        <div className="stat-card"><div className="stat-card-value">{stats.purchased}</div><div className="stat-card-label">Purchased</div></div>
        <div className="stat-card"><div className="stat-card-value">{stats.assembly}</div><div className="stat-card-label">Assemblies</div></div>
        <div className="stat-card"><div className="stat-card-value">{stats.active}</div><div className="stat-card-label">Active Parts</div></div>
      </div>
      <div className="search-box"><Icons.Search /><input type="text" placeholder="Search parts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
      <div className="filter-row">
        <button className={`filter-btn ${!typeFilter ? 'active' : ''}`} onClick={() => setTypeFilter(null)}>All Types<span className="count">{stats.active}</span></button>
        <button className={`filter-btn ${typeFilter === 'manufactured' ? 'active' : ''}`} onClick={() => setTypeFilter('manufactured')}>Manufactured<span className="count">{stats.manufactured}</span></button>
        <button className={`filter-btn ${typeFilter === 'purchased' ? 'active' : ''}`} onClick={() => setTypeFilter('purchased')}>Purchased<span className="count">{stats.purchased}</span></button>
        <button className={`filter-btn ${typeFilter === 'assembly' ? 'active' : ''}`} onClick={() => setTypeFilter('assembly')}>Assembly<span className="count">{stats.assembly}</span></button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>Active</button>
          <button className={`filter-btn ${statusFilter === 'obsolete' ? 'active' : ''}`} onClick={() => setStatusFilter('obsolete')}>Obsolete</button>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Part Number</th><th>Description</th><th>Type</th><th>UOM</th><th>Supplier/Material</th><th>Stock Weight</th><th>Finished Weight</th><th></th></tr></thead>
          <tbody>
            {filteredParts.map(part => {
              const supplier = getSupplier(part.supplier_id);
              const material = getMaterial(part.stock_material_id);
              const stockWeight = part.type === 'manufactured' && part.stock_dimensions && material
                ? StockCalculations.calculateWeight(part.stock_form, part.stock_dimensions, material.density)
                : 0;
              return (
                <tr key={part.id} onClick={() => onSelectPart(part)} style={{ cursor: 'pointer' }}>
                  <td><strong style={{ fontFamily: 'monospace', color: 'var(--accent-orange)' }}>{part.part_number}</strong></td>
                  <td>{part.description}</td>
                  <td><span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: `${getPartTypeBadgeColor(part.type)}22`,
                    color: getPartTypeBadgeColor(part.type)
                  }}>{getPartTypeLabel(part.type)}</span></td>
                  <td>{part.uom || 'EA'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {part.type === 'purchased' && supplier ? supplier.name : ''}
                    {part.type === 'manufactured' && material ? material.name : ''}
                    {part.type === 'assembly' ? '-' : ''}
                  </td>
                  <td>
                    {stockWeight > 0 ? (
                      <span style={{ color: 'var(--accent-orange)', fontFamily: 'monospace' }}>
                        {stockWeight.toFixed(3)} kg
                      </span>
                    ) : '-'}
                  </td>
                  <td>{part.finished_weight ? `${parseFloat(part.finished_weight).toFixed(3)} kg` : '-'}</td>
                  <td><button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); onSelectPart(part); }}>View →</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredParts.length === 0 && (<div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No parts found</div>)}
    </>
  );
}

// ============================================
// ADD PROJECT MODAL
// ============================================
function AddProjectModal({ customers, nextProjectNumber, onClose, onSave }) {
  const [formData, setFormData] = useState({ title: '', customerId: '', dateStarted: new Date().toISOString().split('T')[0], dueDate: '', value: '' });
  const [customerSearch, setCustomerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [numberOfCopies, setNumberOfCopies] = useState(1);
  const [createAnother, setCreateAnother] = useState(false);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const filteredCustomers = customerSearch.length > 0 ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.contact && c.contact.toLowerCase().includes(customerSearch.toLowerCase()))) : customers;

  const handleCustomerSelect = (customer) => { setFormData({ ...formData, customerId: customer.id }); setCustomerSearch(''); setShowDropdown(false); };

  const handleSubmit = () => {
    if (!formData.title || !formData.customerId || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Save the project (or multiple copies)
    onSave(formData, numberOfCopies);

    // If creating multiple projects, always close
    if (numberOfCopies > 1) {
      onClose();
    }
    // If "Create Another" is checked (and creating single project), reset form but keep customer
    else if (createAnother) {
      setFormData({
        title: '',
        customerId: formData.customerId,
        dateStarted: new Date().toISOString().split('T')[0],
        dueDate: '',
        value: ''
      });
      setNumberOfCopies(1);
      setCreateAnother(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2 className="modal-title"><Icons.Briefcase /> New Project</h2><button className="modal-close" onClick={onClose}><Icons.X /></button></div>
        <div className="modal-body">
          <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--text-muted)' }}>Project Number:</span><span className="project-number" style={{ fontSize: 16 }}>#{nextProjectNumber}</span></div>
          <div className="form-group"><label className="form-label">Project Title *</label><input type="text" className="form-input" placeholder="e.g., Front Suspension Development" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
          <div className="form-group">
            <label className="form-label">Customer *</label>
            {selectedCustomer ? (<div className="autocomplete-selected"><span style={{ fontWeight: 500 }}>{selectedCustomer.name}</span>{selectedCustomer.contact && (<span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({selectedCustomer.contact})</span>)}<button onClick={() => setFormData({ ...formData, customerId: '' })}><Icons.X /></button></div>) : (
              <div className="autocomplete-container">
                <input type="text" className="form-input" placeholder="Start typing to search customers..." value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowDropdown(true); setHighlightedIndex(0); }} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} />
                {showDropdown && (<div className="autocomplete-dropdown">{filteredCustomers.slice(0, 10).map((customer, index) => (<div key={customer.id} className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`} onClick={() => handleCustomerSelect(customer)} onMouseEnter={() => setHighlightedIndex(index)}><div className="autocomplete-item-name">{customer.name}</div>{customer.contact && (<div className="autocomplete-item-detail">{customer.contact}</div>)}</div>))}{filteredCustomers.length === 0 && (<div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>No customers found</div>)}</div>)}
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date Started *</label><input type="date" className="form-input" value={formData.dateStarted} onChange={e => setFormData({ ...formData, dateStarted: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Due Date *</label><input type="date" className="form-input" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Value (£)</label><input type="number" className="form-input" placeholder="0.00" min="0" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} /></div>

          {/* Duplication Options */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, marginTop: 20 }}>
            <div className="form-group">
              <label className="form-label">Number of Copies</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="10"
                value={numberOfCopies}
                onChange={e => setNumberOfCopies(parseInt(e.target.value) || 1)}
                style={{ width: 100 }}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Create {numberOfCopies} identical project{numberOfCopies > 1 ? 's' : ''} with sequential project numbers
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={createAnother}
                  onChange={e => setCreateAnother(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span>Create another project with this customer after saving</span>
              </label>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginLeft: 24 }}>
                Keep modal open and reset form for creating similar projects
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}><Icons.Check /> Create Project{numberOfCopies > 1 ? 's' : ''}</button></div>
      </div>
    </div>
  );
}

// ============================================
// ADD PART MODAL
// ============================================
function AddPartModal({ suppliers, materials, parts, onClose, onSave }) {
  const nextPartNumber = PartNumberUtils.getNextPartNumber(parts);

  const [formData, setFormData] = useState({
    part_number: nextPartNumber,
    description: '',
    type: 'manufactured',
    uom: 'EA',
    finished_weight: '',
    // Purchased part fields
    supplier_id: '',
    supplier_code: '',
    // Manufactured part fields
    stock_material_id: '',
    stock_form: 'round_bar',
    stock_dimensions: {}
  });

  // Update part number when type changes
  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      part_number: newType === 'purchased' ? '' : nextPartNumber,
      supplier_id: '',
      stock_material_id: ''
    });
  };

  const handleSubmit = () => {
    if (!formData.description) {
      alert('Please fill in part description');
      return;
    }
    if (!formData.part_number) {
      alert('Please enter a part number');
      return;
    }
    if (formData.type === 'purchased' && !formData.supplier_id) {
      alert('Please select a supplier for purchased parts');
      return;
    }
    onSave(formData);
  };

  const stockForms = [
    { value: 'round_bar', label: 'Round Bar' },
    { value: 'flat_bar', label: 'Flat Bar' },
    { value: 'plate', label: 'Plate' },
    { value: 'hex_bar', label: 'Hex Bar' },
    { value: 'tube', label: 'Tube' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title"><Icons.Package /> New Part</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <div className="modal-body">
          {/* Part Type Selection - moved to top */}
          <div className="form-group">
            <label className="form-label">Part Type *</label>
            <select className="form-select" value={formData.type} onChange={e => handleTypeChange(e.target.value)}>
              <option value="manufactured">Manufactured</option>
              <option value="purchased">Purchased</option>
              <option value="assembly">Assembly</option>
            </select>
          </div>

          {/* Part Number - auto-generated or manual based on type */}
          {formData.type === 'purchased' ? (
            <div className="form-group">
              <label className="form-label">Part Number (Supplier SKU) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter supplier's SKU/part number"
                value={formData.part_number}
                onChange={e => setFormData({ ...formData, part_number: e.target.value })}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          ) : (
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Part Number:</span>
              <span className="project-number" style={{ fontSize: 16, fontFamily: 'monospace' }}>{formData.part_number}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>(auto-generated)</span>
            </div>
          )}

          {/* Basic Part Info */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input type="text" className="form-input" placeholder="Part description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">UOM</label>
            <input type="text" className="form-input" placeholder="EA" value={formData.uom} onChange={e => setFormData({ ...formData, uom: e.target.value })} />
          </div>

          {/* Purchased Part Fields */}
          {formData.type === 'purchased' && (
            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <select className="form-select" value={formData.supplier_id} onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}>
                <option value="">Select supplier...</option>
                {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
          )}

          {/* Manufactured Part Fields */}
          {formData.type === 'manufactured' && (
            <>
              <div className="form-group">
                <label className="form-label">Stock Material</label>
                <select className="form-select" value={formData.stock_material_id} onChange={e => setFormData({ ...formData, stock_material_id: e.target.value })}>
                  <option value="">Select material...</option>
                  {materials.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stock Form</label>
                <select className="form-select" value={formData.stock_form} onChange={e => setFormData({ ...formData, stock_form: e.target.value, stock_dimensions: {} })}>
                  {stockForms.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
                </select>
              </div>

              {/* Stock Dimensions */}
              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8, marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>Stock Dimensions (all in mm)</div>
                <div className="form-row">
                  {StockCalculations.getDimensionFields(formData.stock_form).map(field => (
                    <div key={field.name} className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 12 }}>{field.label}</label>
                      <input
                        type={field.type}
                        className="form-input"
                        placeholder="0"
                        step="0.01"
                        value={formData.stock_dimensions[field.name] || ''}
                        onChange={e => setFormData({
                          ...formData,
                          stock_dimensions: { ...formData.stock_dimensions, [field.name]: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  ))}
                </div>
                {formData.stock_material_id && Object.keys(formData.stock_dimensions).length > 0 && (
                  <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 6, borderLeft: '3px solid var(--accent-orange)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Calculated Stock Weight</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent-orange)' }}>
                      {StockCalculations.calculateWeight(
                        formData.stock_form,
                        formData.stock_dimensions,
                        materials.find(m => m.id === formData.stock_material_id)?.density || 0
                      ).toFixed(3)} kg
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="form-group">
            <label className="form-label">Finished Weight (kg)</label>
            <input type="number" className="form-input" placeholder="0.000" step="0.001" value={formData.finished_weight} onChange={e => setFormData({ ...formData, finished_weight: e.target.value })} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}><Icons.Check /> Create Part</button>
        </div>
      </div>
    </div>
  );
}


// ============================================
// MAIN APP EXPORT
// ============================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  if (loading) return (<><style>{styles}</style><div className="loading-container"><div className="spinner"></div><p style={{ color: '#a1a1a6' }}>Loading...</p></div></>);
  if (!user) return (<><style>{styles}</style><LoginPage onLogin={setUser} /></>);
  return <MainApp user={user} onLogout={handleLogout} />;
}
