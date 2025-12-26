import { useState } from 'react';
import Icons from '../components/common/Icons';

export default function BOMExplorerView({ parts, suppliers, materials, bomRelations }) {
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
