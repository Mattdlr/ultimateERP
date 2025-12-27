/**
 * PartDetailView Component
 * Displays detailed information about a single part including:
 * - Part details and metadata
 * - Stock material information (for manufactured parts)
 * - Bill of Materials (for assemblies)
 * - Machining operations (for manufactured parts)
 * - Where-used information
 * - Revision history
 * 
 * Extracted from App.jsx (lines 3444-4567, 1,124 lines)
 */

import React, { useState } from 'react';
import Icons from '../components/common/Icons';
import StockCalculations from '../utils/stockCalculations';
import PartNumberUtils from '../utils/partNumberUtils';

export default function PartDetailView({ part, parts, suppliers, customers, materials, machines, bomRelations, operations, partRevisions, partCustomers, onBack, onUpdatePart, onDeletePart, onIncrementRevision, onAddBomItem, onRemoveBomItem, onUpdateBomItem, onAddOperation, onUpdateOperation, onDeleteOperation, onAddCustomerToPart, onRemoveCustomerFromPart }) {
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
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const supplier = suppliers.find(s => s.id === part.supplier_id);
  const material = materials.find(m => m.id === part.stock_material_id);

  // Get customers for this part
  const partCustomersList = partCustomers.filter(pc => pc.part_id === part.id);
  const getCustomer = (customerId) => customers.find(c => c.id === customerId);

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
    onUpdateBomItem(editingBomId, { ...editingBomData, quantity: editingBomData.quantity || 1 });
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
    { id: 'operations', label: 'Manufacturing Processes', icon: Icons.Settings, show: part.type === 'manufactured' },
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

            {/* Customer Assignment */}
            <div className="card" style={{ marginTop: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Package /> Customer Assignment
                </div>
                {!isEditing && (
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddCustomer(!showAddCustomer)}>
                    <Icons.Plus /> Assign Customer
                  </button>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Some parts may be owned by customers. If no customer is assigned, the part belongs to your company.
              </div>

              {/* Add Customer Form */}
              {showAddCustomer && (
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Select Customer</label>
                    <select
                      className="form-select"
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">-- Select Customer --</option>
                      {customers
                        .filter(c => !partCustomersList.find(pc => pc.customer_id === c.id))
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (!selectedCustomerId) { alert('Please select a customer'); return; }
                        onAddCustomerToPart(part.id, selectedCustomerId);
                        setSelectedCustomerId('');
                        setShowAddCustomer(false);
                      }}
                    >
                      <Icons.Check /> Assign
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddCustomer(false);
                        setSelectedCustomerId('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Assigned Customers List */}
              {partCustomersList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {partCustomersList.map(pc => {
                    const customer = getCustomer(pc.customer_id);
                    return customer ? (
                      <div
                        key={pc.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 12,
                          background: 'var(--bg-secondary)',
                          borderRadius: 6,
                          borderLeft: '3px solid var(--accent-blue)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {customer.name}
                          </div>
                          {customer.email && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {customer.email}
                            </div>
                          )}
                        </div>
                        {!isEditing && (
                          <button
                            className="btn btn-ghost"
                            onClick={() => {
                              if (confirm(`Remove ${customer.name} from this part?`)) {
                                onRemoveCustomerFromPart(pc.id);
                              }
                            }}
                            style={{ color: '#ef4444' }}
                          >
                            <Icons.Trash />
                          </button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 6 }}>
                  No customers assigned. This part belongs to your company.
                </div>
              )}
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

        {/* Manufacturing Processes Tab */}
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
                      <input type="number" className="form-input" min="1" value={newBomItem.quantity} onChange={e => setNewBomItem({ ...newBomItem, quantity: e.target.value === '' ? '' : parseInt(e.target.value) })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Position</label>
                      <input type="text" className="form-input" placeholder="Optional" value={newBomItem.position} onChange={e => setNewBomItem({ ...newBomItem, position: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={() => {
                      if (!newBomItem.child_id) { alert('Please select a child part'); return; }
                      onAddBomItem(part.id, newBomItem.child_id, newBomItem.quantity || 1, newBomItem.position);
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
                                onChange={e => setEditingBomData({ ...editingBomData, quantity: e.target.value === '' ? '' : parseFloat(e.target.value) })}
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
