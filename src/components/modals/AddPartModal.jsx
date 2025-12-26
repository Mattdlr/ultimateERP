import { useState } from 'react';
import Icons from '../common/Icons';
import StockCalculations from '../../utils/stockCalculations';
import PartNumberUtils from '../../utils/partNumberUtils';

export default function AddPartModal({ suppliers, materials, parts, onClose, onSave }) {
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
