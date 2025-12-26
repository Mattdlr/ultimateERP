import { useState } from 'react';
import Icons from '../components/common/Icons';

export default function MachinesView({ machines, onAddMachine, onUpdateMachine, onDeleteMachine }) {
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
