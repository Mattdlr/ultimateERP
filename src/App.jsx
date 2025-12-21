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
    .app-container, .header, .sidebar, .sidebar-overlay, .toast, .page-header, .filter-row, .search-box, .stats-row, .mobile-menu-btn, .project-cards, .main-content, .content-area, .print-preview-toolbar { display: none !important; }
    .print-preview-modal { position: static !important; background: none !important; padding: 0 !important; display: block !important; }
    .print-preview-content { max-width: none !important; max-height: none !important; box-shadow: none !important; }
    .print-preview-body { padding: 20px !important; }
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
  const [customers, setCustomers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Parts management state
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: customersData } = await supabase.from('customers').select('*').order('name');
      const { data: projectsData } = await supabase.from('projects').select('*, project_notes (*)').order('project_number', { ascending: false });
      const { data: suppliersData } = await supabase.from('suppliers').select('*').order('name');
      const { data: materialsData } = await supabase.from('materials').select('*').order('name');
      const { data: partsData } = await supabase.from('parts').select('*').order('part_number');
      const { data: machinesData } = await supabase.from('machines').select('*').order('name');

      setCustomers(customersData || []);
      setProjects(projectsData || []);
      setSuppliers(suppliersData || []);
      setMaterials(materialsData || []);
      setParts(partsData || []);
      setMachines(machinesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Error loading data', 'error');
    }
    setLoading(false);
  };

  const getCustomer = (customerId) => customers.find(c => c.id === customerId);

  const getNextProjectNumber = () => {
    const maxNum = projects.reduce((max, p) => {
      const num = parseInt(p.project_number);
      return num > max ? num : max;
    }, 0);
    return String(maxNum + 1).padStart(4, '0');
  };

  const handleAddProject = async (projectData) => {
    try {
      const { data, error } = await supabase.from('projects').insert({
        project_number: getNextProjectNumber(),
        title: projectData.title,
        customer_id: projectData.customerId,
        date_started: projectData.dateStarted,
        due_date: projectData.dueDate,
        value: parseFloat(projectData.value) || 0,
        status: 'in-progress'
      }).select().single();
      if (error) throw error;
      setProjects([{ ...data, project_notes: [] }, ...projects]);
      setShowAddProjectModal(false);
      showToast(`Project ${data.project_number} created`);
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
      const { data, error } = await supabase.from('project_notes').insert({ project_id: projectId, text: text, created_by: user.id }).select().single();
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
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== projectId));
      setSelectedProject(null);
      showToast('Project deleted');
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast('Error deleting project', 'error');
    }
  };

  const handleAddCustomer = async (customerData) => {
    try {
      const { data, error } = await supabase.from('customers').insert(customerData).select().single();
      if (error) throw error;
      setCustomers([...customers, data].sort((a, b) => a.name.localeCompare(b.name)));
      showToast('Customer added');
    } catch (err) {
      console.error('Error adding customer:', err);
      showToast('Error adding customer', 'error');
    }
  };

  const handleUpdateCustomer = async (customerId, updates) => {
    try {
      const { error } = await supabase.from('customers').update(updates).eq('id', customerId);
      if (error) throw error;
      setCustomers(customers.map(c => c.id === customerId ? { ...c, ...updates } : c));
      showToast('Customer updated');
    } catch (err) {
      console.error('Error updating customer:', err);
      showToast('Error updating customer', 'error');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const inUse = projects.some(p => p.customer_id === customerId);
    if (inUse) { showToast('Cannot delete: customer has projects', 'error'); return; }
    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) throw error;
      setCustomers(customers.filter(c => c.id !== customerId));
      showToast('Customer deleted');
    } catch (err) {
      console.error('Error deleting customer:', err);
      showToast('Error deleting customer', 'error');
    }
  };

  // ============================================
  // SUPPLIERS HANDLERS
  // ============================================
  const handleAddSupplier = async (supplierData) => {
    try {
      const { data, error } = await supabase.from('suppliers').insert(supplierData).select().single();
      if (error) throw error;
      setSuppliers([...suppliers, data].sort((a, b) => a.name.localeCompare(b.name)));
      showToast('Supplier added');
    } catch (err) {
      console.error('Error adding supplier:', err);
      showToast('Error adding supplier', 'error');
    }
  };

  const handleUpdateSupplier = async (supplierId, updates) => {
    try {
      const { error } = await supabase.from('suppliers').update(updates).eq('id', supplierId);
      if (error) throw error;
      setSuppliers(suppliers.map(s => s.id === supplierId ? { ...s, ...updates } : s));
      showToast('Supplier updated');
    } catch (err) {
      console.error('Error updating supplier:', err);
      showToast('Error updating supplier', 'error');
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    const inUse = parts.some(p => p.supplier_id === supplierId);
    if (inUse) { showToast('Cannot delete: supplier has parts', 'error'); return; }
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
      if (error) throw error;
      setSuppliers(suppliers.filter(s => s.id !== supplierId));
      showToast('Supplier deleted');
    } catch (err) {
      console.error('Error deleting supplier:', err);
      showToast('Error deleting supplier', 'error');
    }
  };

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
      const { error } = await supabase.from('materials').delete().eq('id', materialId);
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
      const { data, error } = await supabase.from('parts').insert(partData).select().single();
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
      const { error } = await supabase.from('parts').delete().eq('id', partId);
      if (error) throw error;
      setParts(parts.filter(p => p.id !== partId));
      setSelectedPart(null);
      showToast('Part deleted');
    } catch (err) {
      console.error('Error deleting part:', err);
      showToast('Error deleting part', 'error');
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
              <div className={`nav-item ${activeView === 'customers' ? 'active' : ''}`} onClick={() => { setActiveView('customers'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Users /><span>Customers</span></div>
            </div>
            <div className="nav-section">
              <div className="nav-section-title">Parts Management</div>
              <div className={`nav-item ${activeView === 'parts' ? 'active' : ''}`} onClick={() => { setActiveView('parts'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Package /><span>Parts</span></div>
              <div className={`nav-item ${activeView === 'suppliers' ? 'active' : ''}`} onClick={() => { setActiveView('suppliers'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Truck /><span>Suppliers</span></div>
              <div className={`nav-item ${activeView === 'materials' ? 'active' : ''}`} onClick={() => { setActiveView('materials'); setSelectedProject(null); setSelectedPart(null); setMobileMenuOpen(false); }}><Icons.Layers /><span>Materials</span></div>
            </div>
          </nav>
          <main className="content-area">
            {activeView === 'projects' && !selectedProject && (<ProjectsView projects={projects} customers={customers} getCustomer={getCustomer} onSelectProject={setSelectedProject} onAddProject={() => setShowAddProjectModal(true)} />)}
            {activeView === 'projects' && selectedProject && (<ProjectDetailView project={selectedProject} customer={getCustomer(selectedProject.customer_id)} onBack={() => setSelectedProject(null)} onUpdateProject={handleUpdateProject} onAddNote={handleAddNote} onDeleteProject={handleDeleteProject} />)}
            {activeView === 'customers' && (<CustomersView customers={customers} projects={projects} onAddCustomer={handleAddCustomer} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} />)}
            {activeView === 'suppliers' && (<SuppliersView suppliers={suppliers} parts={parts} onAddSupplier={handleAddSupplier} onUpdateSupplier={handleUpdateSupplier} onDeleteSupplier={handleDeleteSupplier} />)}
            {activeView === 'materials' && (<MaterialsView materials={materials} parts={parts} onAddMaterial={handleAddMaterial} onUpdateMaterial={handleUpdateMaterial} onDeleteMaterial={handleDeleteMaterial} />)}
            {activeView === 'parts' && !selectedPart && (<PartsView parts={parts} suppliers={suppliers} materials={materials} onSelectPart={setSelectedPart} onAddPart={() => setShowAddPartModal(true)} />)}
            {activeView === 'parts' && selectedPart && (<PartDetailView part={selectedPart} suppliers={suppliers} materials={materials} machines={machines} onBack={() => setSelectedPart(null)} onUpdatePart={handleUpdatePart} onDeletePart={handleDeletePart} />)}
          </main>
        </div>
        {showAddProjectModal && (<AddProjectModal customers={customers} nextProjectNumber={getNextProjectNumber()} onClose={() => setShowAddProjectModal(false)} onSave={handleAddProject} />)}
        {showAddPartModal && (<AddPartModal suppliers={suppliers} materials={materials} onClose={() => setShowAddPartModal(false)} onSave={handleAddPart} />)}
        {toast && (<div className={`toast ${toast.type}`}>{toast.type === 'success' ? <Icons.Check /> : <Icons.X />}<span>{toast.message}</span></div>)}
      </div>
    </>
  );
}

// ============================================
// PROJECTS VIEW
// ============================================
function ProjectsView({ projects, customers, getCustomer, onSelectProject, onAddProject }) {
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesSearch = !searchQuery || project.title.toLowerCase().includes(searchQuery.toLowerCase()) || project.project_number.includes(searchQuery) || getCustomer(project.customer_id)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      <div className="filter-row">
        <button className={`filter-btn ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter(null)}>All<span className="count">{stats.total}</span></button>
        <button className={`filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`} onClick={() => setStatusFilter('in-progress')}>In Progress<span className="count">{stats.inProgress}</span></button>
        <button className={`filter-btn ${statusFilter === 'on-hold' ? 'active' : ''}`} onClick={() => setStatusFilter('on-hold')}>On Hold<span className="count">{stats.onHold}</span></button>
        <button className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`} onClick={() => setStatusFilter('completed')}>Completed<span className="count">{stats.completed}</span></button>
      </div>
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
function ProjectDetailView({ project, customer, onBack, onUpdateProject, onAddNote, onDeleteProject }) {
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

  const startEdit = () => { setEditData({ title: project.title, due_date: project.due_date, value: project.value }); setIsEditing(true); };
  const saveEdit = () => { onUpdateProject(project.id, editData); setIsEditing(false); };

  const isOverdue = project.status !== 'completed' && project.due_date && new Date(project.due_date) < new Date();
  const notes = project.project_notes || [];

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
            <p style={{ color: 'var(--text-secondary)' }}>{customer?.name || 'Unknown Customer'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEditing ? (<><button className="btn btn-primary" onClick={saveEdit}><Icons.Check /> Save</button><button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button></>) : (<><button className="btn btn-secondary" onClick={startEdit}><Icons.Pencil /> Edit</button><button className="btn btn-ghost" onClick={() => { if (confirm('Are you sure you want to delete this project?')) onDeleteProject(project.id); }} style={{ color: '#ef4444' }}><Icons.Trash /></button></>)}
          </div>
        </div>
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
            {notes.length === 0 ? (<div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No notes yet</div>) : ([...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(note => (<div key={note.id} className="note-item"><div className="note-timestamp">{formatDateTime(note.created_at)}</div><div className="note-text">{note.text}</div></div>)))}
          </div>
          <div className="add-note-form">
            <textarea className="form-input" placeholder="Add a note..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddNote(); }} />
            <button className="btn btn-primary" onClick={handleAddNote} disabled={!newNote.trim()}><Icons.Plus /> Add Note</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// CUSTOMERS VIEW
// ============================================
function CustomersView({ customers, projects, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) {
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => { if (!newCustomer.name) return; onAddCustomer(newCustomer); setNewCustomer({ name: '', contact: '', email: '', phone: '' }); };
  const startEdit = (customer) => { setEditingId(customer.id); setEditData({ ...customer }); };
  const saveEdit = () => { onUpdateCustomer(editingId, editData); setEditingId(null); };

  const getProjectCount = (customerId) => projects.filter(p => p.customer_id === customerId).length;
  const getActiveProjectCount = (customerId) => projects.filter(p => p.customer_id === customerId && p.status !== 'completed').length;
  const getTotalValue = (customerId) => projects.filter(p => p.customer_id === customerId).reduce((sum, p) => sum + parseFloat(p.value || 0), 0);

  return (
    <>
      <div className="page-header"><div><h1 className="page-title">Customers</h1><p className="page-subtitle">Manage customer information</p></div></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Company Name *</label><input type="text" className="form-input" placeholder="Company name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Contact Person</label><input type="text" className="form-input" placeholder="Name" value={newCustomer.contact} onChange={e => setNewCustomer({ ...newCustomer, contact: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Email</label><input type="email" className="form-input" placeholder="email@company.com" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Phone</label><input type="text" className="form-input" placeholder="Phone number" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={handleAdd}><Icons.Plus /> Add Customer</button>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Customer</th><th>Contact</th><th>Email</th><th>Phone</th><th>Projects</th><th>Total Value</th><th></th></tr></thead>
          <tbody>
            {customers.map(customer => {
              const projectCount = getProjectCount(customer.id);
              const activeCount = getActiveProjectCount(customer.id);
              const totalValue = getTotalValue(customer.id);
              const isEditing = editingId === customer.id;
              if (isEditing) {
                return (<tr key={customer.id}><td><input type="text" className="form-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="text" className="form-input" value={editData.contact || ''} onChange={e => setEditData({ ...editData, contact: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="email" className="form-input" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="text" className="form-input" value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} style={{ padding: '6px 10px' }} /></td><td>{projectCount}</td><td>£{totalValue.toLocaleString()}</td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={saveEdit} style={{ color: 'var(--accent-green)' }}><Icons.Check /></button><button className="btn btn-ghost" onClick={() => setEditingId(null)}><Icons.X /></button></div></td></tr>);
              }
              return (<tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.contact}</td><td>{customer.email && (<a href={`mailto:${customer.email}`} style={{ color: 'var(--accent-blue)' }}>{customer.email}</a>)}</td><td>{customer.phone}</td><td>{projectCount} total{activeCount > 0 && <span style={{ color: 'var(--accent-orange)', marginLeft: 4 }}>({activeCount} active)</span>}</td><td style={{ fontFamily: 'monospace', color: 'var(--accent-green)' }}>£{totalValue.toLocaleString()}</td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={() => startEdit(customer)}><Icons.Pencil /></button><button className="btn btn-ghost" onClick={() => onDeleteCustomer(customer.id)} disabled={projectCount > 0} style={{ opacity: projectCount > 0 ? 0.3 : 1 }}><Icons.Trash /></button></div></td></tr>);
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ============================================
// SUPPLIERS VIEW
// ============================================
function SuppliersView({ suppliers, parts, onAddSupplier, onUpdateSupplier, onDeleteSupplier }) {
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '', phone: '', lead_time: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newSupplier.name) return;
    onAddSupplier(newSupplier);
    setNewSupplier({ name: '', contact: '', email: '', phone: '', lead_time: 0 });
  };
  const startEdit = (supplier) => { setEditingId(supplier.id); setEditData({ ...supplier }); };
  const saveEdit = () => { onUpdateSupplier(editingId, editData); setEditingId(null); };

  const getPartCount = (supplierId) => parts.filter(p => p.supplier_id === supplierId).length;

  return (
    <>
      <div className="page-header"><div><h1 className="page-title">Suppliers</h1><p className="page-subtitle">Manage supplier information</p></div></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Supplier Name *</label><input type="text" className="form-input" placeholder="Supplier name" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Contact Person</label><input type="text" className="form-input" placeholder="Name" value={newSupplier.contact} onChange={e => setNewSupplier({ ...newSupplier, contact: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Email</label><input type="email" className="form-input" placeholder="email@supplier.com" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Phone</label><input type="text" className="form-input" placeholder="Phone number" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Lead Time (days)</label><input type="number" className="form-input" placeholder="0" value={newSupplier.lead_time} onChange={e => setNewSupplier({ ...newSupplier, lead_time: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={handleAdd}><Icons.Plus /> Add Supplier</button>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Supplier</th><th>Contact</th><th>Email</th><th>Phone</th><th>Lead Time</th><th>Parts</th><th></th></tr></thead>
          <tbody>
            {suppliers.map(supplier => {
              const partCount = getPartCount(supplier.id);
              const isEditing = editingId === supplier.id;
              if (isEditing) {
                return (<tr key={supplier.id}><td><input type="text" className="form-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="text" className="form-input" value={editData.contact || ''} onChange={e => setEditData({ ...editData, contact: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="email" className="form-input" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="text" className="form-input" value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} style={{ padding: '6px 10px' }} /></td><td><input type="number" className="form-input" value={editData.lead_time || 0} onChange={e => setEditData({ ...editData, lead_time: e.target.value })} style={{ padding: '6px 10px' }} /></td><td>{partCount}</td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={saveEdit} style={{ color: 'var(--accent-green)' }}><Icons.Check /></button><button className="btn btn-ghost" onClick={() => setEditingId(null)}><Icons.X /></button></div></td></tr>);
              }
              return (<tr key={supplier.id}><td><strong>{supplier.name}</strong></td><td>{supplier.contact}</td><td>{supplier.email && (<a href={`mailto:${supplier.email}`} style={{ color: 'var(--accent-blue)' }}>{supplier.email}</a>)}</td><td>{supplier.phone}</td><td>{supplier.lead_time || 0} days</td><td>{partCount}</td><td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost" onClick={() => startEdit(supplier)}><Icons.Pencil /></button><button className="btn btn-ghost" onClick={() => onDeleteSupplier(supplier.id)} disabled={partCount > 0} style={{ opacity: partCount > 0 ? 0.3 : 1 }}><Icons.Trash /></button></div></td></tr>);
            })}
          </tbody>
        </table>
      </div>
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
          <thead><tr><th>Part Number</th><th>Description</th><th>Type</th><th>UOM</th><th>Supplier/Material</th><th>Weight</th><th></th></tr></thead>
          <tbody>
            {filteredParts.map(part => {
              const supplier = getSupplier(part.supplier_id);
              const material = getMaterial(part.stock_material_id);
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

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const filteredCustomers = customerSearch.length > 0 ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.contact && c.contact.toLowerCase().includes(customerSearch.toLowerCase()))) : customers;

  const handleCustomerSelect = (customer) => { setFormData({ ...formData, customerId: customer.id }); setCustomerSearch(''); setShowDropdown(false); };
  const handleSubmit = () => { if (!formData.title || !formData.customerId || !formData.dueDate) { alert('Please fill in all required fields'); return; } onSave(formData); };

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
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}><Icons.Check /> Create Project</button></div>
      </div>
    </div>
  );
}

// ============================================
// ADD PART MODAL
// ============================================
function AddPartModal({ suppliers, materials, onClose, onSave }) {
  const [formData, setFormData] = useState({
    part_number: '',
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

  const handleSubmit = () => {
    if (!formData.part_number || !formData.description) {
      alert('Please fill in part number and description');
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
          {/* Basic Part Info */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Part Number *</label>
              <input type="text" className="form-input" placeholder="e.g., P-0001" value={formData.part_number} onChange={e => setFormData({ ...formData, part_number: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">UOM</label>
              <input type="text" className="form-input" placeholder="EA" value={formData.uom} onChange={e => setFormData({ ...formData, uom: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input type="text" className="form-input" placeholder="Part description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          {/* Part Type Selection */}
          <div className="form-group">
            <label className="form-label">Part Type *</label>
            <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, supplier_id: '', stock_material_id: '' })}>
              <option value="manufactured">Manufactured</option>
              <option value="purchased">Purchased</option>
              <option value="assembly">Assembly</option>
            </select>
          </div>

          {/* Purchased Part Fields */}
          {formData.type === 'purchased' && (
            <>
              <div className="form-group">
                <label className="form-label">Supplier *</label>
                <select className="form-select" value={formData.supplier_id} onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}>
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Supplier Part Code</label>
                <input type="text" className="form-input" placeholder="Supplier's part number" value={formData.supplier_code} onChange={e => setFormData({ ...formData, supplier_code: e.target.value })} />
              </div>
            </>
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
                <select className="form-select" value={formData.stock_form} onChange={e => setFormData({ ...formData, stock_form: e.target.value })}>
                  {stockForms.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
                </select>
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
function PartDetailView({ part, suppliers, materials, machines, onBack, onUpdatePart, onDeletePart }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const supplier = suppliers.find(s => s.id === part.supplier_id);
  const material = materials.find(m => m.id === part.stock_material_id);

  const startEdit = () => {
    setEditData({
      description: part.description,
      finished_weight: part.finished_weight,
      supplier_code: part.supplier_code,
      revision_notes: part.revision_notes
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdatePart(part.id, editData);
    setIsEditing(false);
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

  return (
    <>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Parts</button>
      <div className="detail-panel">
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
            {isEditing ? (
              <input type="text" className="form-input" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }} />
            ) : (
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>{part.description}</h2>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEditing ? (
              <>
                <button className="btn btn-primary" onClick={saveEdit}><Icons.Check /> Save</button>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={startEdit}><Icons.Pencil /> Edit</button>
                <button className="btn btn-ghost" onClick={() => { if (confirm('Are you sure you want to delete this part?')) onDeletePart(part.id); }} style={{ color: '#ef4444' }}><Icons.Trash /></button>
              </>
            )}
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card"><div className="info-label">UOM</div><div className="info-value">{part.uom || 'EA'}</div></div>
          <div className="info-card">
            <div className="info-label">Finished Weight</div>
            {isEditing ? (
              <input type="number" className="form-input" step="0.001" value={editData.finished_weight || ''} onChange={e => setEditData({ ...editData, finished_weight: e.target.value })} />
            ) : (
              <div className="info-value">{part.finished_weight ? `${parseFloat(part.finished_weight).toFixed(3)} kg` : '-'}</div>
            )}
          </div>

          {part.type === 'purchased' && (
            <>
              <div className="info-card"><div className="info-label">Supplier</div><div className="info-value">{supplier?.name || '-'}</div></div>
              <div className="info-card">
                <div className="info-label">Supplier Code</div>
                {isEditing ? (
                  <input type="text" className="form-input" value={editData.supplier_code || ''} onChange={e => setEditData({ ...editData, supplier_code: e.target.value })} />
                ) : (
                  <div className="info-value">{part.supplier_code || '-'}</div>
                )}
              </div>
            </>
          )}

          {part.type === 'manufactured' && (
            <>
              <div className="info-card"><div className="info-label">Stock Material</div><div className="info-value">{material?.name || '-'}</div></div>
              <div className="info-card"><div className="info-label">Stock Form</div><div className="info-value">{part.stock_form ? part.stock_form.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}</div></div>
            </>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <button className={`btn ${part.status === 'active' ? 'btn-secondary' : 'btn-primary'}`} onClick={handleStatusToggle}>
            {part.status === 'active' ? 'Mark as Obsolete' : 'Mark as Active'}
          </button>
        </div>

        {isEditing && (
          <div className="notes-section" style={{ marginTop: 24 }}>
            <div className="form-group">
              <label className="form-label">Revision Notes</label>
              <textarea className="form-textarea" rows="4" placeholder="Add revision notes..." value={editData.revision_notes || ''} onChange={e => setEditData({ ...editData, revision_notes: e.target.value })} />
            </div>
          </div>
        )}

        {!isEditing && part.revision_notes && (
          <div className="notes-section" style={{ marginTop: 24 }}>
            <div className="notes-header">
              <div className="notes-title"><Icons.FileText /> Revision Notes</div>
            </div>
            <div style={{ padding: 16, color: 'var(--text-primary)' }}>{part.revision_notes}</div>
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
