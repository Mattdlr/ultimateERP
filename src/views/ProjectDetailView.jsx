/**
 * ProjectDetailView Component  
 * Displays detailed information about a single project including:
 * - Project details and metadata
 * - Project notes
 * - Parts check-ins tracking
 * - Delivery notes with printing capability
 * 
 * Extracted from App.jsx (lines 1676-2190, 514 lines)
 */

import React, { useState } from 'react';
import Icons from '../components/common/Icons';
import AddCheckinModal from '../components/modals/AddCheckinModal';
import AddDeliveryNoteModal from '../components/modals/AddDeliveryNoteModal';

export default function ProjectDetailView({ project, customer, customers, checkins, checkinItems, deliveryNotes, deliveryNoteItems, parts, onBack, onUpdateProject, onAddNote, onDeleteProject, onAddCheckin, onDeleteCheckin, onAddDeliveryNote, onDeleteDeliveryNote }) {
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
