import { useState } from 'react';
import Icons from '../components/common/Icons';

export default function MaterialsView({ materials, parts, onAddMaterial, onUpdateMaterial, onDeleteMaterial }) {
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
