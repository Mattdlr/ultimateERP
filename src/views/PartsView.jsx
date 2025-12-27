import { useState } from 'react';
import Icons from '../components/common/Icons';
import StockCalculations from '../utils/stockCalculations';

export default function PartsView({ parts, suppliers, materials, onSelectPart, onAddPart }) {
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
          <thead><tr><th>Part Number</th><th>Description</th><th>Type</th><th>Supplier/Material</th><th>Stock Weight</th><th>Finished Weight</th><th></th></tr></thead>
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
