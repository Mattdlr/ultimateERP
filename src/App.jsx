import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// ============================================
// STYLES
// ============================================
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

// ============================================
// ICONS
// ============================================
const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Briefcase: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  FileText: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Printer: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Pencil: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  LogOut: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Package: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Truck: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Layers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.196-13.196l-4.242 4.242m0 5.656l-4.242 4.242M23 12h-6m-6 0H1m18.196 5.196l-4.242-4.242m-5.656 0l-4.242 4.242"/></svg>,
  List: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  ShoppingCart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
};

// ============================================
// STOCK WEIGHT CALCULATION UTILITIES
// ============================================
const StockCalculations = {
  // Calculate volume in cubic meters based on stock form and dimensions
  calculateVolume: (stockForm, dimensions) => {
    if (!stockForm || !dimensions) return 0;

    const d = dimensions;
    const PI = Math.PI;

    switch (stockForm) {
      case 'round_bar':
        // Volume = π × r² × length
        if (!d.diameter || !d.length) return 0;
        const radius = d.diameter / 2000; // mm to m
        const length = d.length / 1000; // mm to m
        return PI * radius * radius * length;

      case 'flat_bar':
        // Volume = width × thickness × length
        if (!d.width || !d.thickness || !d.length) return 0;
        return (d.width / 1000) * (d.thickness / 1000) * (d.length / 1000);

      case 'plate':
        // Volume = width × length × thickness
        if (!d.width || !d.length || !d.thickness) return 0;
        return (d.width / 1000) * (d.length / 1000) * (d.thickness / 1000);

      case 'hex_bar':
        // Volume = (3√3/2) × s² × length, where s is across flats / 2
        if (!d.across_flats || !d.length) return 0;
        const s = d.across_flats / 2000; // mm to m
        const hexLength = d.length / 1000; // mm to m
        return (3 * Math.sqrt(3) / 2) * s * s * hexLength;

      case 'tube':
        // Volume = π × (R² - r²) × length
        if (!d.outer_diameter || !d.wall_thickness || !d.length) return 0;
        const outerRadius = d.outer_diameter / 2000; // mm to m
        const innerRadius = (d.outer_diameter - 2 * d.wall_thickness) / 2000; // mm to m
        const tubeLength = d.length / 1000; // mm to m
        return PI * (outerRadius * outerRadius - innerRadius * innerRadius) * tubeLength;

      default:
        return 0;
    }
  },

  // Calculate weight in kg
  calculateWeight: (stockForm, dimensions, density) => {
    if (!density) return 0;
    const volume = StockCalculations.calculateVolume(stockForm, dimensions);
    return volume * density; // kg/m³ × m³ = kg
  },

  // Get dimension field labels for each stock form
  getDimensionFields: (stockForm) => {
    const fields = {
      round_bar: [
        { name: 'diameter', label: 'Diameter (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ],
      flat_bar: [
        { name: 'width', label: 'Width (mm)', type: 'number' },
        { name: 'thickness', label: 'Thickness (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ],
      plate: [
        { name: 'width', label: 'Width (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' },
        { name: 'thickness', label: 'Thickness (mm)', type: 'number' }
      ],
      hex_bar: [
        { name: 'across_flats', label: 'Across Flats (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ],
      tube: [
        { name: 'outer_diameter', label: 'Outer Diameter (mm)', type: 'number' },
        { name: 'wall_thickness', label: 'Wall Thickness (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ]
    };
    return fields[stockForm] || [];
  }
};

// ============================================
// PART NUMBER UTILITIES
// ============================================
const PartNumberUtils = {
  // Parse a part number into components
  parse: (partNumber) => {
    if (!partNumber) return null;
    const match = partNumber.match(/^UL-(\d{4})-(\d{2})$/);
    if (!match) return null;
    return {
      prefix: 'UL',
      number: parseInt(match[1], 10),
      revision: parseInt(match[2], 10),
      numberStr: match[1],
      revisionStr: match[2]
    };
  },

  // Generate the next available part number
  getNextPartNumber: (existingParts) => {
    let maxNumber = 0;

    existingParts.forEach(part => {
      const parsed = PartNumberUtils.parse(part.part_number);
      if (parsed && parsed.number > maxNumber) {
        maxNumber = parsed.number;
      }
    });

    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `UL-${nextNumber}-01`;
  },

  // Increment the revision of a part number
  incrementRevision: (partNumber) => {
    const parsed = PartNumberUtils.parse(partNumber);
    if (!parsed) return null;

    const newRevision = (parsed.revision + 1).toString().padStart(2, '0');
    return `UL-${parsed.numberStr}-${newRevision}`;
  },

  // Format a part number display with highlighting
  formatDisplay: (partNumber) => {
    const parsed = PartNumberUtils.parse(partNumber);
    if (!parsed) return partNumber;
    return {
      prefix: 'UL',
      number: parsed.numberStr,
      revision: parsed.revisionStr
    };
  }
};

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

// ============================================
// PROJECT DETAIL VIEW
// ============================================
function ProjectDetailView({ project, customer, customers, checkins, checkinItems, deliveryNotes, deliveryNoteItems, parts, onBack, onUpdateProject, onAddNote, onDeleteProject, onAddCheckin, onDeleteCheckin, onAddDeliveryNote, onDeleteDeliveryNote }) {
  const [activeTab, setActiveTab] = useState('details');
  const [showAddCheckinModal, setShowAddCheckinModal] = useState(false);
  const [expandedCheckins, setExpandedCheckins] = useState([]);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const [showAddDeliveryNoteModal, setShowAddDeliveryNoteModal] = useState(false);
  const [expandedDeliveryNotes, setExpandedDeliveryNotes] = useState([]);
  const [printingDeliveryNote, setPrintingDeliveryNote] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Get check-ins for this project
  const projectCheckins = checkins.filter(c => c.project_id === project.id);

  // Get items for a specific check-in
  const getCheckinItems = (checkinId) => checkinItems.filter(item => item.checkin_id === checkinId);

  // Toggle check-in expansion
  const toggleCheckin = (checkinId) => {
    if (expandedCheckins.includes(checkinId)) {
      setExpandedCheckins(expandedCheckins.filter(id => id !== checkinId));
    } else {
      setExpandedCheckins([...expandedCheckins, checkinId]);
    }
  };

  // Get delivery notes for this project
  const projectDeliveryNotes = deliveryNotes.filter(dn => dn.project_id === project.id);

  // Get items for a specific delivery note
  const getDeliveryNoteItems = (deliveryNoteId) => deliveryNoteItems.filter(item => item.delivery_note_id === deliveryNoteId);

  // Toggle delivery note expansion
  const toggleDeliveryNote = (deliveryNoteId) => {
    if (expandedDeliveryNotes.includes(deliveryNoteId)) {
      setExpandedDeliveryNotes(expandedDeliveryNotes.filter(id => id !== deliveryNoteId));
    } else {
      setExpandedDeliveryNotes([...expandedDeliveryNotes, deliveryNoteId]);
    }
  };

  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const formatDate = (dateStr) => { if (!dateStr) return '-'; return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
  const formatDateTime = (dateStr) => { if (!dateStr) return '-'; return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };

  const handleAddNote = () => { if (!newNote.trim()) return; onAddNote(project.id, newNote.trim()); setNewNote(''); };

  const handleStatusChange = (newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'completed' && !project.actual_finish_date) updates.actual_finish_date = new Date().toISOString().split('T')[0];
    if (newStatus !== 'completed') updates.actual_finish_date = null;
    onUpdateProject(project.id, updates);
  };

  const startEdit = () => { setEditData({ title: project.title, customer_id: project.customer_id, due_date: project.due_date, value: project.value }); setIsEditing(true); };
  const saveEdit = () => { onUpdateProject(project.id, editData); setIsEditing(false); setCustomerSearch(''); };

  const selectedEditCustomer = customers.find(c => c.id === editData.customer_id);
  const filteredCustomers = customerSearch.length > 0 ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.contact && c.contact.toLowerCase().includes(customerSearch.toLowerCase()))) : customers;
  const handleCustomerSelect = (customerId) => { setEditData({ ...editData, customer_id: customerId }); setCustomerSearch(''); setShowCustomerDropdown(false); };

  const isOverdue = project.status !== 'completed' && project.due_date && new Date(project.due_date) < new Date();
  const notes = project.project_notes || [];

  // Define tabs
  const tabs = [
    { id: 'details', label: 'Details', icon: Icons.FileText },
    { id: 'checkins', label: 'Check-ins', icon: Icons.Package },
    { id: 'delivery', label: 'Delivery Notes', icon: Icons.Truck }
  ];

  return (
    <>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Projects</button>
      <div className="detail-panel">
        <div className="detail-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <span className="project-number" style={{ fontSize: 16 }}>#{project.project_number}</span>
              <span className={`project-status ${project.status}`}>{project.status.replace('-', ' ')}</span>
              {isOverdue && <span style={{ color: '#ef4444', fontSize: 13 }}>⚠️ Overdue</span>}
            </div>
            {isEditing ? (<input type="text" className="form-input" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }} />) : (<h2 style={{ fontSize: 22, marginBottom: 4 }}>{project.title}</h2>)}
            {isEditing ? (
              <div style={{ marginTop: 8 }}>
                {selectedEditCustomer ? (
                  <div className="autocomplete-selected" style={{ marginBottom: 0 }}>
                    <span style={{ fontWeight: 500 }}>{selectedEditCustomer.name}</span>
                    {selectedEditCustomer.contact && (<span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({selectedEditCustomer.contact})</span>)}
                    <button onClick={() => setEditData({ ...editData, customer_id: '' })}><Icons.X /></button>
                  </div>
                ) : (
                  <div className="autocomplete-container">
                    <input type="text" className="form-input" placeholder="Start typing to search customers..." value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }} onFocus={() => setShowCustomerDropdown(true)} onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)} style={{ fontSize: 14 }} />
                    {showCustomerDropdown && (<div className="autocomplete-dropdown">{filteredCustomers.slice(0, 10).map((cust) => (<div key={cust.id} className="autocomplete-item" onClick={() => handleCustomerSelect(cust.id)}><div className="autocomplete-item-name">{cust.name}</div>{cust.contact && (<div className="autocomplete-item-detail">{cust.contact}</div>)}</div>))}{filteredCustomers.length === 0 && (<div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>No customers found</div>)}</div>)}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>{customer?.name || 'Unknown Customer'}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEditing ? (<><button className="btn btn-primary" onClick={saveEdit}><Icons.Check /> Save</button><button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button></>) : (<><button className="btn btn-secondary" onClick={() => setShowLabelPreview(true)}><Icons.Printer /> Print Label</button><button className="btn btn-secondary" onClick={startEdit}><Icons.Pencil /> Edit</button><button className="btn btn-ghost" onClick={() => { if (confirm('Are you sure you want to delete this project?')) onDeleteProject(project.id); }} style={{ color: '#ef4444' }}><Icons.Trash /></button></>)}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={{ borderBottom: '2px solid var(--border-color)', marginTop: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TabIcon style={{ width: 16, height: 16 }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <>
            <div className="info-grid">
              <div className="info-card"><div className="info-label">Date Started</div><div className="info-value">{formatDate(project.date_started)}</div></div>
              <div className="info-card"><div className="info-label">Due Date</div>{isEditing ? (<input type="date" className="form-input" value={editData.due_date} onChange={e => setEditData({ ...editData, due_date: e.target.value })} />) : (<div className="info-value" style={isOverdue ? { color: '#ef4444' } : {}}>{formatDate(project.due_date)}</div>)}</div>
              <div className="info-card"><div className="info-label">Actual Finish</div><div className="info-value">{project.actual_finish_date ? formatDate(project.actual_finish_date) : '-'}</div></div>
              <div className="info-card"><div className="info-label">Value</div>{isEditing ? (<input type="number" className="form-input" value={editData.value} onChange={e => setEditData({ ...editData, value: e.target.value })} />) : (<div className="info-value money">£{parseFloat(project.value || 0).toLocaleString()}</div>)}</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Update Status</div>
              <div className="status-buttons">
                <button className={`btn ${project.status === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleStatusChange('in-progress')}>In Progress</button>
                <button className={`btn ${project.status === 'on-hold' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleStatusChange('on-hold')} style={project.status === 'on-hold' ? { background: '#fbbf24', borderColor: '#fbbf24' } : {}}>On Hold</button>
                <button className={`btn ${project.status === 'completed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleStatusChange('completed')} style={project.status === 'completed' ? { background: 'var(--accent-green)', borderColor: 'var(--accent-green)' } : {}}>Completed</button>
              </div>
            </div>
            <div className="notes-section">
              <div className="notes-header"><div className="notes-title"><Icons.FileText /> Project Notes</div><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</span></div>
              <div className="notes-list">
                {notes.length === 0 ? (<div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No notes yet</div>) : ([...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(note => (<div key={note.id} className="note-item"><div className="note-timestamp">{formatDateTime(note.created_at)} {note.created_by_email && <span style={{ color: 'var(--accent-orange)', marginLeft: 8 }}>• {note.created_by_email}</span>}</div><div className="note-text">{note.text}</div></div>)))}
              </div>
              <div className="add-note-form">
                <textarea className="form-input" placeholder="Add a note..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddNote(); }} />
                <button className="btn btn-primary" onClick={handleAddNote} disabled={!newNote.trim()}><Icons.Plus /> Add Note</button>
              </div>
            </div>
          </>
        )}

        {/* Check-ins Tab */}
        {activeTab === 'checkins' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Package /> Parts Check-ins
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Track parts received from customer
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddCheckinModal(true)}>
                <Icons.Plus /> New Check-in
              </button>
            </div>

            {projectCheckins.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projectCheckins.map(checkin => {
                const items = getCheckinItems(checkin.id);
                const isExpanded = expandedCheckins.includes(checkin.id);
                return (
                  <div key={checkin.id} className="card" style={{ background: 'var(--bg-tertiary)', padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(checkin.checkin_date)}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {items.length} item{items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {checkin.notes && (
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {checkin.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleCheckin(checkin.id)}
                          style={{ padding: '4px 8px' }}
                        >
                          {isExpanded ? '▼ Hide' : '▶ Show'} Items
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { if (confirm('Delete this check-in?')) onDeleteCheckin(checkin.id); }}
                          style={{ color: '#ef4444', padding: '4px 8px' }}
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>

                    {isExpanded && items.length > 0 && (
                      <div className="table-container" style={{ marginTop: 12 }}>
                        <table className="table">
                          <thead>
                            <tr><th>Description</th><th>Quantity</th></tr>
                          </thead>
                          <tbody>
                            {items.map(item => (
                              <tr key={item.id}>
                                <td>{item.description}</td>
                                <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No check-ins yet. Click "New Check-in" to record parts received from the customer.
            </div>
          )}
          </div>
        )}

        {/* Delivery Notes Tab */}
        {activeTab === 'delivery' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.FileText /> Delivery Notes
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Track parts delivered to customer
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddDeliveryNoteModal(true)}>
                <Icons.Plus /> New Delivery Note
              </button>
            </div>

            {projectDeliveryNotes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projectDeliveryNotes.map(deliveryNote => {
                const items = getDeliveryNoteItems(deliveryNote.id);
                const isExpanded = expandedDeliveryNotes.includes(deliveryNote.id);
                return (
                  <div key={deliveryNote.id} className="card" style={{ background: 'var(--bg-tertiary)', padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(deliveryNote.delivery_date)}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {items.length} item{items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {deliveryNote.notes && (
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {deliveryNote.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleDeliveryNote(deliveryNote.id)}
                          style={{ padding: '4px 8px' }}
                        >
                          {isExpanded ? '▼ Hide' : '▶ Show'} Items
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setPrintingDeliveryNote(deliveryNote)}
                          style={{ padding: '4px 8px' }}
                        >
                          <Icons.Printer /> Print
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { if (confirm('Delete this delivery note?')) onDeleteDeliveryNote(deliveryNote.id); }}
                          style={{ color: '#ef4444', padding: '4px 8px' }}
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>

                    {isExpanded && items.length > 0 && (
                      <div className="table-container" style={{ marginTop: 12 }}>
                        <table className="table">
                          <thead>
                            <tr><th>Description</th><th>Quantity</th></tr>
                          </thead>
                          <tbody>
                            {items.map(item => (
                              <tr key={item.id}>
                                <td>{item.description}</td>
                                <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No delivery notes yet. Click "New Delivery Note" to create one.
            </div>
          )}
          </div>
        )}
      </div>

      {/* Add Check-in Modal */}
      {showAddCheckinModal && (
        <AddCheckinModal
          projectId={project.id}
          onClose={() => setShowAddCheckinModal(false)}
          onSave={onAddCheckin}
        />
      )}

      {/* Add Delivery Note Modal */}
      {showAddDeliveryNoteModal && (
        <AddDeliveryNoteModal
          projectId={project.id}
          parts={parts}
          checkinItems={checkinItems.filter(item => {
            const checkin = checkins.find(c => c.id === item.checkin_id);
            return checkin && checkin.project_id === project.id;
          })}
          onClose={() => setShowAddDeliveryNoteModal(false)}
          onSave={onAddDeliveryNote}
        />
      )}

      {/* Label Preview Modal */}
      {showLabelPreview && (
        <div className="print-preview-modal" onClick={() => setShowLabelPreview(false)}>
          <div className="print-preview-content" onClick={e => e.stopPropagation()}>
            <div className="print-preview-toolbar">
              <h3>Print Project Label</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => window.print()}><Icons.Printer /> Print</button>
                <button className="btn btn-secondary" onClick={() => setShowLabelPreview(false)}>Close</button>
              </div>
            </div>
            <div className="label-preview-body">
              <div className="project-label">
                <div className="label-project-number">#{project.project_number}</div>
                <div className="label-customer">{customer?.name || 'Unknown Customer'}</div>
                <div className="label-description">{project.title}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Note Print Preview */}
      {printingDeliveryNote && (
        <div className="print-preview-modal" onClick={() => setPrintingDeliveryNote(null)}>
          <div className="print-preview-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="print-preview-toolbar">
              <h3>Print Delivery Note</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => window.print()}><Icons.Printer /> Print</button>
                <button className="btn btn-secondary" onClick={() => setPrintingDeliveryNote(null)}>Close</button>
              </div>
            </div>
            <div className="label-preview-body">
              <div style={{ background: 'white', color: '#000', padding: '50px 40px', minHeight: '297mm', maxWidth: '210mm', margin: '0 auto', fontSize: '13px', lineHeight: 1.5, fontFamily: 'Arial, sans-serif' }}>

                {/* Header with Logo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 35 }}>
                  {/* Left: Document Title and Customer */}
                  <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 'bold', margin: 0, marginBottom: 30, color: '#000', letterSpacing: '-0.5px' }}>DELIVERY NOTE</h1>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{customer?.name || 'Unknown Customer'}</div>
                      {customer?.address && customer.address.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Logo and Company Details */}
                  <div style={{ textAlign: 'right', marginLeft: 40 }}>
                    {/* Logo */}
                    <div style={{ marginBottom: 20 }}>
                      <img
                        src="/assets/Logo v3-600x220.png"
                        alt="Ultimate Performance"
                        style={{ width: '200px', height: 'auto' }}
                      />
                    </div>

                    {/* Company Address */}
                    <div style={{ fontSize: 11, lineHeight: 1.6, color: '#000' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Ultimate Performance Limited</div>
                      <div>9-10 Twigden Barns</div>
                      <div>Creaton Road</div>
                      <div>Creaton</div>
                      <div>NORTHAMPTON</div>
                      <div>Northamptonshire</div>
                      <div>NN6 8LU</div>
                      <div>GBR</div>
                      <div style={{ marginTop: 8 }}>
                        <div><strong>T:</strong> 01604 505222</div>
                        <div><strong>E:</strong> accounts@ultimatep.com</div>
                        <div><strong>W:</strong> www.ultimatep.com</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Note Details */}
                <div style={{ marginBottom: 30 }}>
                  <table style={{ fontSize: 13, lineHeight: 2 }}>
                    <tbody>
                      <tr>
                        <td style={{ width: 150, fontWeight: 'bold' }}>Delivery Date</td>
                        <td>{formatDate(printingDeliveryNote.delivery_date)}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Delivery Note Number</td>
                        <td>{printingDeliveryNote.delivery_note_number || 'DN-XXX-XX'}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Order No.</td>
                        <td>{project.project_number}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Items Table */}
                <div style={{ marginBottom: 40 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 13, fontWeight: 'bold', width: 60 }}>Item</th>
                        <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 13, fontWeight: 'bold' }}>Description</th>
                        <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 13, fontWeight: 'bold', width: 80 }}>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDeliveryNoteItems(printingDeliveryNote.id).map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ padding: '10px 0', fontSize: 13, verticalAlign: 'top' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 0', fontSize: 13, verticalAlign: 'top' }}>{item.description}</td>
                          <td style={{ padding: '10px 0', fontSize: 13, textAlign: 'right', verticalAlign: 'top' }}>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                {printingDeliveryNote.notes && (
                  <div style={{ marginBottom: 60, fontSize: 13 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Notes:</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{printingDeliveryNote.notes}</div>
                  </div>
                )}

                {/* Footer with Company Registration */}
                <div style={{ marginTop: 80, fontSize: 9, textAlign: 'center', color: '#000', borderTop: '1px solid #ccc', paddingTop: 10 }}>
                  Company No: 04813549. Registered Office: Unit 9-10, Twigden Barns, Creaton Road, Creaton, Northamptonshire, NN6 8LU
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

  // Xero integration state
  const [xeroConnected, setXeroConnected] = useState(false);
  const [xeroTenantName, setXeroTenantName] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Check Xero connection status on mount
  useEffect(() => {
    checkXeroConnection();
    fetchLastSyncTime();
  }, []);

  const checkXeroConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('xero_credentials')
        .select('tenant_name, expires_at')
        .single();

      if (data && !error) {
        setXeroConnected(true);
        setXeroTenantName(data.tenant_name);
      }
    } catch (err) {
      console.error('Error checking Xero connection:', err);
    }
  };

  const fetchLastSyncTime = async () => {
    try {
      const { data } = await supabase
        .from('xero_sync_log')
        .select('completed_at, status, contacts_synced')
        .eq('sync_type', 'contacts')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLastSyncTime(data.completed_at);
      }
    } catch (err) {
      // No sync history yet
    }
  };

  const handleConnectXero = () => {
    // Construct Xero OAuth URL
    const clientId = import.meta.env.VITE_XERO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_XERO_REDIRECT_URI;
    const scope = 'accounting.contacts.read offline_access';
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://login.xero.com/identity/connect/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

    window.location.href = authUrl;
  };

  const handleSyncXero = async () => {
    setSyncing(true);
    setSyncStatus('Syncing contacts from Xero...');

    try {
      const { data, error } = await supabase.functions.invoke('xero-sync-contacts');

      if (error) throw error;

      if (data.success) {
        setSyncStatus(`Success! Synced ${data.stats.total} contacts (${data.stats.created} new, ${data.stats.updated} updated)`);
        setLastSyncTime(new Date().toISOString());

        // Refresh contacts list
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSyncStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleDisconnectXero = async () => {
    if (!confirm('Are you sure you want to disconnect from Xero? Your synced contacts will remain, but you won\'t be able to sync new contacts until you reconnect.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('xero_credentials')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setXeroConnected(false);
      setXeroTenantName(null);
      alert('Disconnected from Xero successfully');
    } catch (err) {
      console.error('Disconnect error:', err);
      alert('Error disconnecting from Xero');
    }
  };

  const formatSyncTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {xeroConnected ? (
            <>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginRight: 12,
                fontSize: 13
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)' }}>
                  <span style={{ fontSize: 18 }}>✓</span>
                  <strong>Connected to Xero</strong>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {xeroTenantName} • Last sync: {formatSyncTime(lastSyncTime)}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSyncXero}
                disabled={syncing}
              >
                {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleDisconnectXero}
                disabled={syncing}
              >
                Disconnect
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleConnectXero}>
              <Icons.Link /> Connect to Xero
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Message */}
      {syncStatus && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: syncStatus.includes('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)',
          border: `1px solid ${syncStatus.includes('Error') ? '#ef4444' : 'var(--accent-green)'}`,
          color: syncStatus.includes('Error') ? '#ef4444' : 'var(--accent-green)',
          marginBottom: 16,
          fontSize: 14
        }}>
          {syncStatus}
        </div>
      )}

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
// PART DETAIL VIEW
// ============================================
function PartDetailView({ part, parts, suppliers, materials, machines, bomRelations, operations, partRevisions, onBack, onUpdatePart, onDeletePart, onIncrementRevision, onAddBomItem, onRemoveBomItem, onUpdateBomItem, onAddOperation, onUpdateOperation, onDeleteOperation }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAddBomItem, setShowAddBomItem] = useState(false);
  const [newBomItem, setNewBomItem] = useState({ child_id: '', quantity: 1, position: '' });
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [newOperation, setNewOperation] = useState({ op_number: '', machine_id: '', program_name: '', description: '', cycle_time: 0 });
  const [editingOperationId, setEditingOperationId] = useState(null);
  const [editingOperationData, setEditingOperationData] = useState({});
  const [editingBomId, setEditingBomId] = useState(null);
  const [editingBomData, setEditingBomData] = useState({});

  const supplier = suppliers.find(s => s.id === part.supplier_id);
  const material = materials.find(m => m.id === part.stock_material_id);

  // Get BOM items for this assembly
  const bomItems = bomRelations.filter(b => b.parent_id === part.id);

  // Get operations for this manufactured part
  const partOperations = operations.filter(op => op.part_id === part.id).sort((a, b) => a.op_number.localeCompare(b.op_number));

  // Get child part details
  const getChildPart = (childId) => parts.find(p => p.id === childId);

  // Get parent assemblies (where this part is used)
  const parentAssemblies = bomRelations
    .filter(b => b.child_id === part.id)
    .map(b => {
      const parentPart = parts.find(p => p.id === b.parent_id);
      return parentPart ? { ...b, parent: parentPart } : null;
    })
    .filter(Boolean);

  // Get all stock materials from BOM (for assemblies)
  const getBomStockMaterials = () => {
    const stockMaterials = [];
    bomItems.forEach(bomItem => {
      const childPart = getChildPart(bomItem.child_id);
      if (childPart && childPart.type === 'manufactured' && childPart.stock_material_id) {
        const childMaterial = materials.find(m => m.id === childPart.stock_material_id);
        if (childMaterial) {
          const existing = stockMaterials.find(sm => sm.material.id === childMaterial.id);
          if (existing) {
            existing.parts.push({ part: childPart, quantity: bomItem.quantity, bomItem });
          } else {
            stockMaterials.push({
              material: childMaterial,
              parts: [{ part: childPart, quantity: bomItem.quantity, bomItem }]
            });
          }
        }
      }
    });
    return stockMaterials;
  };

  // Calculate total weight for assembly
  const calculateAssemblyWeight = () => {
    let totalWeight = 0;
    bomItems.forEach(bomItem => {
      const childPart = getChildPart(bomItem.child_id);
      if (childPart) {
        // Use finished_weight if available, otherwise use stock weight for manufactured parts
        let childWeight = parseFloat(childPart.finished_weight) || 0;
        if (!childWeight && childPart.type === 'manufactured' && childPart.stock_dimensions && material) {
          const childMaterial = materials.find(m => m.id === childPart.stock_material_id);
          if (childMaterial) {
            childWeight = StockCalculations.calculateWeight(
              childPart.stock_form,
              childPart.stock_dimensions,
              childMaterial.density
            );
          }
        }
        totalWeight += childWeight * bomItem.quantity;
      }
    });
    return totalWeight;
  };

  // Calculate total cycle time for manufactured parts
  const calculateTotalCycleTime = () => {
    return partOperations.reduce((total, op) => total + (parseInt(op.cycle_time) || 0), 0);
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : '-';
  };

  const startEdit = () => {
    setEditData({
      description: part.description,
      uom: part.uom,
      finished_weight: part.finished_weight,
      supplier_id: part.supplier_id,
      supplier_code: part.supplier_code,
      stock_material_id: part.stock_material_id,
      stock_form: part.stock_form,
      stock_dimensions: part.stock_dimensions || {},
      notes: part.notes,
      revision_notes: part.revision_notes
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdatePart(part.id, editData);
    setIsEditing(false);
  };

  const startEditOperation = (operation) => {
    setEditingOperationId(operation.id);
    setEditingOperationData({
      op_number: operation.op_number,
      machine_id: operation.machine_id,
      program_name: operation.program_name,
      description: operation.description,
      cycle_time: operation.cycle_time
    });
  };

  const saveEditOperation = () => {
    onUpdateOperation(editingOperationId, editingOperationData);
    setEditingOperationId(null);
    setEditingOperationData({});
  };

  const cancelEditOperation = () => {
    setEditingOperationId(null);
    setEditingOperationData({});
  };

  const startEditBom = (bomItem) => {
    setEditingBomId(bomItem.id);
    setEditingBomData({
      quantity: bomItem.quantity,
      position: bomItem.position
    });
  };

  const saveEditBom = () => {
    onUpdateBomItem(editingBomId, editingBomData);
    setEditingBomId(null);
    setEditingBomData({});
  };

  const cancelEditBom = () => {
    setEditingBomId(null);
    setEditingBomData({});
  };

  const handleStatusToggle = () => {
    const newStatus = part.status === 'active' ? 'obsolete' : 'active';
    onUpdatePart(part.id, { status: newStatus });
  };

  const getPartTypeBadgeColor = (type) => {
    const colors = {
      manufactured: 'var(--accent-blue)',
      purchased: 'var(--accent-orange)',
      assembly: 'var(--accent-green)'
    };
    return colors[type] || 'var(--text-muted)';
  };

  const getPartTypeLabel = (type) => {
    const labels = { manufactured: 'Manufactured', purchased: 'Purchased', assembly: 'Assembly' };
    return labels[type] || type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Define available tabs based on part type
  const tabs = [
    { id: 'details', label: 'Details', icon: Icons.FileText },
    { id: 'stock', label: 'Stock Material', icon: Icons.Package, show: part.type === 'manufactured' || part.type === 'assembly' },
    { id: 'operations', label: 'Machining Operations', icon: Icons.Settings, show: part.type === 'manufactured' },
    { id: 'bom', label: 'Bill of Materials', icon: Icons.Layers, show: part.type === 'assembly' },
    { id: 'whereused', label: 'Where Used', icon: Icons.Search },
    { id: 'revisions', label: 'Revision History', icon: Icons.FileText }
  ].filter(tab => tab.show !== false);

  return (
    <>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Parts</button>
      <div className="detail-panel">
        {/* Header */}
        <div className="detail-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <span className="project-number" style={{ fontSize: 16 }}>{part.part_number}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: `${getPartTypeBadgeColor(part.type)}22`,
                color: getPartTypeBadgeColor(part.type)
              }}>{getPartTypeLabel(part.type)}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: part.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                color: part.status === 'active' ? 'var(--accent-green)' : '#fbbf24'
              }}>{part.status}</span>
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>{part.description}</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEditing ? (
              <>
                <button className="btn btn-primary" onClick={saveEdit}>
                  <Icons.Check /> Save Changes
                </button>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={startEdit}>
                  <Icons.Pencil /> Edit
                </button>
                <button className="btn btn-secondary" onClick={() => onIncrementRevision(part)} style={{ background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', color: 'white' }}>
                  🔄 Increment Revision
                </button>
                <button className="btn btn-secondary" onClick={handleStatusToggle}>
                  {part.status === 'active' ? 'Mark as Obsolete' : 'Mark as Active'}
                </button>
                <button className="btn btn-ghost" onClick={() => { if (confirm('Are you sure you want to delete this part?')) onDeletePart(part.id); }} style={{ color: '#ef4444' }}>
                  <Icons.Trash />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={{ borderBottom: '2px solid var(--border-color)', marginTop: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    marginBottom: '-2px',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TabIcon style={{ width: 16, height: 16 }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div>
            {/* Details Tab Content */}
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Part Number</div>
                <div className="info-value" style={{ fontFamily: 'monospace', color: 'var(--accent-orange)' }}>{part.part_number}</div>
              </div>
              <div className="info-card">
                <div className="info-label">UOM</div>
                {isEditing ? (
                  <select className="form-input" value={editData.uom || 'EA'} onChange={e => setEditData({ ...editData, uom: e.target.value })}>
                    <option value="EA">EA (Each)</option>
                    <option value="KG">KG (Kilogram)</option>
                    <option value="M">M (Meter)</option>
                    <option value="L">L (Liter)</option>
                    <option value="SET">SET</option>
                  </select>
                ) : (
                  <div className="info-value">{part.uom || 'EA'}</div>
                )}
              </div>
              <div className="info-card">
                <div className="info-label">Status</div>
                <div className="info-value">{part.status}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Type</div>
                <div className="info-value">{getPartTypeLabel(part.type)}</div>
              </div>
            </div>

            <div className="info-grid" style={{ marginTop: 16 }}>
              <div className="info-card">
                <div className="info-label">Created</div>
                <div className="info-value">{formatDate(part.created_at)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Last Updated</div>
                <div className="info-value">{formatDate(part.updated_at)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Finished Weight</div>
                {isEditing ? (
                  <input type="number" className="form-input" step="0.001" value={editData.finished_weight || ''} onChange={e => setEditData({ ...editData, finished_weight: e.target.value })} />
                ) : (
                  <div className="info-value">{part.finished_weight ? `${parseFloat(part.finished_weight).toFixed(3)} kg` : '-'}</div>
                )}
              </div>
              {part.type === 'assembly' && bomItems.length > 0 && (
                <div className="info-card" style={{ background: 'rgba(52,211,153,0.1)', borderLeft: '3px solid var(--accent-green)' }}>
                  <div className="info-label">Assembly Weight</div>
                  <div className="info-value" style={{ color: 'var(--accent-green)', fontSize: 18, fontWeight: 600 }}>
                    {calculateAssemblyWeight().toFixed(3)} kg
                  </div>
                </div>
              )}
            </div>

            {part.type === 'purchased' && (
              <div className="card" style={{ marginTop: 24, background: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Package /> Supplier Information
                </div>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-label">Supplier</div>
                    {isEditing ? (
                      <select className="form-input" value={editData.supplier_id || ''} onChange={e => setEditData({ ...editData, supplier_id: e.target.value || null })}>
                        <option value="">-- Select Supplier --</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="info-value">{supplier?.name || '-'}</div>
                    )}
                  </div>
                  <div className="info-card">
                    <div className="info-label">Supplier Code</div>
                    {isEditing ? (
                      <input type="text" className="form-input" value={editData.supplier_code || ''} onChange={e => setEditData({ ...editData, supplier_code: e.target.value })} />
                    ) : (
                      <div className="info-value">{part.supplier_code || '-'}</div>
                    )}
                  </div>
                  {supplier && !isEditing && (
                    <>
                      <div className="info-card">
                        <div className="info-label">Lead Time</div>
                        <div className="info-value">{supplier.lead_time || 0} days</div>
                      </div>
                      <div className="info-card">
                        <div className="info-label">Contact</div>
                        <div className="info-value">{supplier.contact || '-'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="card" style={{ marginTop: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.FileText /> Description
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                {isEditing ? (
                  <input type="text" className="form-input" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                ) : (
                  <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 6 }}>{part.description}</div>
                )}
              </div>
            </div>

            {/* General Notes (applies to all revisions) */}
            <div className="card" style={{ marginTop: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.FileText /> General Notes
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                These notes apply to all revisions of this part
              </div>
              <div className="form-group">
                {isEditing ? (
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="General notes about this part (e.g., materials, finishes, special handling)..."
                    value={editData.notes || ''}
                    onChange={e => setEditData({ ...editData, notes: e.target.value })}
                  />
                ) : (
                  <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 6, minHeight: 60, whiteSpace: 'pre-wrap' }}>
                    {part.notes || 'No general notes'}
                  </div>
                )}
              </div>
            </div>

            {/* Current Revision Notes */}
            <div className="card" style={{ marginTop: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.FileText /> Current Revision Notes
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Notes specific to revision {part.part_number.split('-').pop() || '00'}
              </div>
              <div className="form-group">
                {isEditing ? (
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Notes specific to this revision (e.g., 'Updated diameter', 'Material change')..."
                    value={editData.revision_notes || ''}
                    onChange={e => setEditData({ ...editData, revision_notes: e.target.value })}
                  />
                ) : (
                  <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 6, minHeight: 60, whiteSpace: 'pre-wrap' }}>
                    {part.revision_notes || 'No revision notes for this revision'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stock Material Tab */}
        {activeTab === 'stock' && part.type === 'manufactured' && (
          <div>
            <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Package /> Stock Material Information
              </div>
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">Material</div>
                  {isEditing ? (
                    <select className="form-input" value={editData.stock_material_id || ''} onChange={e => setEditData({ ...editData, stock_material_id: e.target.value || null })}>
                      <option value="">-- Select Material --</option>
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="info-value">{material?.name || '-'}</div>
                  )}
                </div>
                <div className="info-card">
                  <div className="info-label">Stock Form</div>
                  {isEditing ? (
                    <select className="form-input" value={editData.stock_form || ''} onChange={e => setEditData({ ...editData, stock_form: e.target.value })}>
                      <option value="">-- Select Form --</option>
                      <option value="round_bar">Round Bar</option>
                      <option value="flat_bar">Flat Bar</option>
                      <option value="plate">Plate</option>
                      <option value="hex_bar">Hex Bar</option>
                      <option value="tube">Tube</option>
                    </select>
                  ) : (
                    <div className="info-value">
                      {part.stock_form ? part.stock_form.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                    </div>
                  )}
                </div>
                {material && !isEditing && (
                  <div className="info-card">
                    <div className="info-label">Density</div>
                    <div className="info-value">{material.density} kg/m³</div>
                  </div>
                )}
              </div>
              {((isEditing && editData.stock_form) || (!isEditing && part.stock_dimensions && Object.keys(part.stock_dimensions).length > 0)) && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Dimensions</div>
                  {isEditing ? (
                    <div className="info-grid">
                      {editData.stock_form && StockCalculations.getDimensionFields(editData.stock_form).map(field => (
                        <div key={field.name} className="info-card">
                          <div className="info-label">{field.label}</div>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="mm"
                            value={editData.stock_dimensions?.[field.name] || ''}
                            onChange={e => setEditData({
                              ...editData,
                              stock_dimensions: {
                                ...editData.stock_dimensions,
                                [field.name]: parseFloat(e.target.value) || 0
                              }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="info-grid">
                      {StockCalculations.getDimensionFields(part.stock_form).map(field => (
                        part.stock_dimensions[field.name] && (
                          <div key={field.name} className="info-card">
                            <div className="info-label">{field.label}</div>
                            <div className="info-value">{part.stock_dimensions[field.name]} mm</div>
                          </div>
                        )
                      ))}
                      <div className="info-card" style={{ background: 'rgba(255,107,53,0.1)', borderLeft: '3px solid var(--accent-orange)' }}>
                        <div className="info-label">Stock Weight</div>
                        <div className="info-value" style={{ color: 'var(--accent-orange)', fontSize: 20, fontWeight: 600 }}>
                          {StockCalculations.calculateWeight(
                            part.stock_form,
                            part.stock_dimensions,
                            material?.density || 0
                          ).toFixed(3)} kg
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Stock Material Tab for Assemblies */}
        {activeTab === 'stock' && part.type === 'assembly' && (
          <div>
            <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Package /> Stock Materials from BOM
              </div>
              {getBomStockMaterials().length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {getBomStockMaterials().map(stockMat => (
                    <div key={stockMat.material.id} className="card" style={{ background: 'var(--bg-secondary)', padding: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--accent-orange)' }}>
                        {stockMat.material.name}
                      </div>
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Part</th>
                              <th>Form</th>
                              <th>Qty in Assy</th>
                              <th>Unit Weight</th>
                              <th>Total Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stockMat.parts.map(({ part: childPart, quantity, bomItem }) => {
                              const childMaterial = materials.find(m => m.id === childPart.stock_material_id);
                              const unitWeight = childPart.stock_dimensions ? StockCalculations.calculateWeight(
                                childPart.stock_form,
                                childPart.stock_dimensions,
                                childMaterial?.density || 0
                              ) : 0;
                              return (
                                <tr key={bomItem.id}>
                                  <td>
                                    <div>{childPart.part_number}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{childPart.description}</div>
                                  </td>
                                  <td>{childPart.stock_form?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-'}</td>
                                  <td>{quantity}</td>
                                  <td>{unitWeight > 0 ? `${unitWeight.toFixed(3)} kg` : '-'}</td>
                                  <td style={{ fontWeight: 600 }}>{unitWeight > 0 ? `${(unitWeight * quantity).toFixed(3)} kg` : '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No manufactured parts with stock materials in BOM
                </div>
              )}
            </div>
          </div>
        )}

        {/* Machining Operations Tab */}
        {activeTab === 'operations' && part.type === 'manufactured' && (
          <div>
            <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Settings /> Manufacturing Routing
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddOperation(!showAddOperation)}>
                  <Icons.Plus /> Add Operation
                </button>
              </div>

              {/* Add Operation Form */}
              {showAddOperation && (
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <div className="form-row">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Op Number *</label>
                      <input type="text" className="form-input" placeholder="e.g., OP10" value={newOperation.op_number} onChange={e => setNewOperation({ ...newOperation, op_number: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Machine</label>
                      <select className="form-select" value={newOperation.machine_id} onChange={e => setNewOperation({ ...newOperation, machine_id: e.target.value })}>
                        <option value="">Select machine...</option>
                        {machines.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Program Name</label>
                      <input type="text" className="form-input" placeholder="e.g., O1234" value={newOperation.program_name} onChange={e => setNewOperation({ ...newOperation, program_name: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cycle Time (min)</label>
                      <input type="number" className="form-input" min="0" value={newOperation.cycle_time} onChange={e => setNewOperation({ ...newOperation, cycle_time: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Description</label>
                    <input type="text" className="form-input" placeholder="Operation description" value={newOperation.description} onChange={e => setNewOperation({ ...newOperation, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={() => {
                      if (!newOperation.op_number) { alert('Please enter operation number'); return; }
                      onAddOperation({ ...newOperation, part_id: part.id });
                      setNewOperation({ op_number: '', machine_id: '', program_name: '', description: '', cycle_time: 0 });
                      setShowAddOperation(false);
                    }}><Icons.Check /> Add</button>
                    <button className="btn btn-secondary" onClick={() => { setShowAddOperation(false); setNewOperation({ op_number: '', machine_id: '', program_name: '', description: '', cycle_time: 0 }); }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Operations Table */}
              {partOperations.length > 0 ? (
                <>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr><th>Op #</th><th>Machine</th><th>Program</th><th>Description</th><th>Cycle Time</th><th></th></tr>
                      </thead>
                      <tbody>
                        {partOperations.map(op => {
                          const isEditingThis = editingOperationId === op.id;
                          return isEditingThis ? (
                            <tr key={op.id} style={{ background: 'var(--bg-secondary)' }}>
                              <td>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={editingOperationData.op_number}
                                  onChange={e => setEditingOperationData({ ...editingOperationData, op_number: e.target.value })}
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-input"
                                  value={editingOperationData.machine_id || ''}
                                  onChange={e => setEditingOperationData({ ...editingOperationData, machine_id: e.target.value })}
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                >
                                  <option value="">Select...</option>
                                  {machines.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={editingOperationData.program_name || ''}
                                  onChange={e => setEditingOperationData({ ...editingOperationData, program_name: e.target.value })}
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={editingOperationData.description || ''}
                                  onChange={e => setEditingOperationData({ ...editingOperationData, description: e.target.value })}
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  value={editingOperationData.cycle_time || 0}
                                  onChange={e => setEditingOperationData({ ...editingOperationData, cycle_time: e.target.value })}
                                  style={{ padding: '6px 10px', fontSize: '13px', width: '80px' }}
                                />
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button className="btn btn-ghost" onClick={saveEditOperation} style={{ color: 'var(--accent-green)' }}>
                                    <Icons.Check />
                                  </button>
                                  <button className="btn btn-ghost" onClick={cancelEditOperation}>
                                    <Icons.X />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={op.id}>
                              <td><strong style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{op.op_number}</strong></td>
                              <td>{getMachineName(op.machine_id)}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{op.program_name || '-'}</td>
                              <td>{op.description || '-'}</td>
                              <td>{op.cycle_time || 0} min</td>
                              <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button className="btn btn-ghost" onClick={() => startEditOperation(op)}>
                                    <Icons.Pencil />
                                  </button>
                                  <button className="btn btn-ghost" onClick={() => { if (confirm('Delete this operation?')) onDeleteOperation(op.id); }} style={{ color: '#ef4444' }}>
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
                  <div style={{ marginTop: 16, padding: 16, background: 'rgba(59,130,246,0.1)', borderRadius: 8, borderLeft: '3px solid var(--accent-blue)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Cycle Time</div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent-blue)' }}>
                          {calculateTotalCycleTime()} min
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {partOperations.length} operation{partOperations.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No operations defined yet. Click "Add Operation" to start building the routing.
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOM Tab for Assembly Parts */}
        {activeTab === 'bom' && part.type === 'assembly' && (
          <div>
            <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Layers /> Bill of Materials
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddBomItem(!showAddBomItem)}>
                  <Icons.Plus /> Add Component
                </button>
              </div>

              {/* Add BOM Item Form */}
              {showAddBomItem && (
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <div className="form-row">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Child Part *</label>
                      <select className="form-select" value={newBomItem.child_id} onChange={e => setNewBomItem({ ...newBomItem, child_id: e.target.value })}>
                        <option value="">Select part...</option>
                        {parts.filter(p => p.id !== part.id).map(p => (
                          <option key={p.id} value={p.id}>{p.part_number} - {p.description}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Quantity *</label>
                      <input type="number" className="form-input" min="1" value={newBomItem.quantity} onChange={e => setNewBomItem({ ...newBomItem, quantity: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Position</label>
                      <input type="text" className="form-input" placeholder="Optional" value={newBomItem.position} onChange={e => setNewBomItem({ ...newBomItem, position: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={() => {
                      if (!newBomItem.child_id) { alert('Please select a child part'); return; }
                      onAddBomItem(part.id, newBomItem.child_id, newBomItem.quantity, newBomItem.position);
                      setNewBomItem({ child_id: '', quantity: 1, position: '' });
                      setShowAddBomItem(false);
                    }}><Icons.Check /> Add</button>
                    <button className="btn btn-secondary" onClick={() => { setShowAddBomItem(false); setNewBomItem({ child_id: '', quantity: 1, position: '' }); }}>Cancel</button>
                  </div>
                </div>
              )}

            {/* BOM Items Table */}
            {bomItems.length > 0 ? (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr><th>Part Number</th><th>Description</th><th>Type</th><th>Supplier</th><th>Qty</th><th>Unit Weight</th><th>Total Weight</th><th>Position</th><th></th></tr>
                    </thead>
                    <tbody>
                      {bomItems.map(bomItem => {
                        const childPart = getChildPart(bomItem.child_id);
                        if (!childPart) return null;
                        const childSupplier = childPart.type === 'purchased' ? suppliers.find(s => s.id === childPart.supplier_id) : null;
                        let unitWeight = parseFloat(childPart.finished_weight) || 0;
                        if (!unitWeight && childPart.type === 'manufactured' && childPart.stock_dimensions) {
                          const childMaterial = materials.find(m => m.id === childPart.stock_material_id);
                          if (childMaterial) {
                            unitWeight = StockCalculations.calculateWeight(
                              childPart.stock_form,
                              childPart.stock_dimensions,
                              childMaterial.density
                            );
                          }
                        }
                        const totalWeight = unitWeight * bomItem.quantity;
                        const isEditingThis = editingBomId === bomItem.id;

                        return isEditingThis ? (
                          <tr key={bomItem.id} style={{ background: 'var(--bg-secondary)' }}>
                            <td><strong style={{ fontFamily: 'monospace', color: 'var(--accent-orange)' }}>{childPart.part_number}</strong></td>
                            <td>{childPart.description}</td>
                            <td><span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{childPart.type}</span></td>
                            <td>{childSupplier ? childSupplier.name : '-'}</td>
                            <td>
                              <input
                                type="number"
                                className="form-input"
                                min="1"
                                step="0.01"
                                value={editingBomData.quantity}
                                onChange={e => setEditingBomData({ ...editingBomData, quantity: parseFloat(e.target.value) || 1 })}
                                style={{ padding: '6px 10px', fontSize: '13px', width: '80px' }}
                              />
                            </td>
                            <td>{unitWeight > 0 ? `${unitWeight.toFixed(3)} kg` : '-'}</td>
                            <td style={{ fontWeight: 600 }}>{unitWeight > 0 ? `${(unitWeight * editingBomData.quantity).toFixed(3)} kg` : '-'}</td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Optional"
                                value={editingBomData.position || ''}
                                onChange={e => setEditingBomData({ ...editingBomData, position: e.target.value })}
                                style={{ padding: '6px 10px', fontSize: '13px', width: '100px' }}
                              />
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-ghost" onClick={saveEditBom} style={{ color: 'var(--accent-green)' }}>
                                  <Icons.Check />
                                </button>
                                <button className="btn btn-ghost" onClick={cancelEditBom}>
                                  <Icons.X />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={bomItem.id}>
                            <td><strong style={{ fontFamily: 'monospace', color: 'var(--accent-orange)' }}>{childPart.part_number}</strong></td>
                            <td>{childPart.description}</td>
                            <td><span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{childPart.type}</span></td>
                            <td>{childSupplier ? childSupplier.name : '-'}</td>
                            <td>{bomItem.quantity}</td>
                            <td>{unitWeight > 0 ? `${unitWeight.toFixed(3)} kg` : '-'}</td>
                            <td style={{ fontWeight: 600 }}>{totalWeight > 0 ? `${totalWeight.toFixed(3)} kg` : '-'}</td>
                            <td>{bomItem.position || '-'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-ghost" onClick={() => startEditBom(bomItem)}>
                                  <Icons.Pencil />
                                </button>
                                <button className="btn btn-ghost" onClick={() => { if (confirm('Remove this component from BOM?')) onRemoveBomItem(bomItem.id); }} style={{ color: '#ef4444' }}>
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
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(52,211,153,0.1)', borderRadius: 8, borderLeft: '3px solid var(--accent-green)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Assembly Weight</div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent-green)' }}>
                        {calculateAssemblyWeight().toFixed(3)} kg
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {bomItems.length} component{bomItems.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                No components in BOM yet. Click "Add Component" to start building the assembly.
              </div>
            )}
            </div>
          </div>
        )}

        {/* Where Used Tab */}
        {activeTab === 'whereused' && (
          <div>
            <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Search /> Where This Part is Used
              </div>
              {parentAssemblies.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Assembly Part Number</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentAssemblies.map(({ parent, quantity, position, id }) => (
                        <tr key={id}>
                          <td><strong style={{ fontFamily: 'monospace', color: 'var(--accent-orange)' }}>{parent.part_number}</strong></td>
                          <td>{parent.description}</td>
                          <td><span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{parent.type}</span></td>
                          <td>{quantity}</td>
                          <td>{position || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  This part is not used in any assemblies yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revision History Tab */}
        {activeTab === 'revisions' && (
          <div>
            {/* Current Revision */}
            <div className="card" style={{ background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-green)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.FileText /> Current Revision
              </div>
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">Revision</div>
                  <div className="info-value" style={{ fontFamily: 'monospace', color: 'var(--accent-green)', fontSize: 18, fontWeight: 600 }}>
                    {part.part_number.split('-').pop() || '00'}
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-label">Part Number</div>
                  <div className="info-value" style={{ fontFamily: 'monospace' }}>{part.part_number}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Last Updated</div>
                  <div className="info-value">{formatDate(part.updated_at)}</div>
                </div>
              </div>

              {part.revision_notes && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>REVISION NOTES</div>
                  <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 6, whiteSpace: 'pre-wrap', fontSize: 14 }}>
                    {part.revision_notes}
                  </div>
                </div>
              )}
            </div>

            {/* Revision History */}
            <div className="card" style={{ marginTop: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.FileText /> Revision History
              </div>
              {partRevisions.filter(r => r.part_id === part.id).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {partRevisions
                    .filter(r => r.part_id === part.id)
                    .map(revision => (
                      <div key={revision.id} className="card" style={{ background: 'var(--bg-secondary)', padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                              <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>
                                Revision {revision.revision_number}
                              </span>
                              <span style={{ marginLeft: 12, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>
                                {revision.part_number}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Created: {formatDate(revision.created_at)}
                            </div>
                          </div>
                        </div>

                        {revision.revision_notes && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>REVISION NOTES</div>
                            <div style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 4, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                              {revision.revision_notes}
                            </div>
                          </div>
                        )}

                        {/* Show key changes from this revision */}
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>SNAPSHOT</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 12 }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Description:</span> {revision.description}
                            </div>
                            {revision.finished_weight && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Weight:</span> {parseFloat(revision.finished_weight).toFixed(3)} kg
                              </div>
                            )}
                            {revision.stock_form && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Stock Form:</span> {revision.stock_form.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No previous revisions. Revision history will appear here when you increment the revision.
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, padding: 16, background: 'rgba(59,130,246,0.1)', borderRadius: 8, borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                <strong>Note:</strong> When you click "Increment Revision", the current revision data is saved to history, and you can add notes explaining the changes made in the new revision.
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                This provides full traceability of all changes across revisions.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
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
