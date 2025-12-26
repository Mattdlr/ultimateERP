import { useState } from 'react';
import Icons from '../components/common/Icons';
import StockCalculations from '../utils/stockCalculations';

export default function OrderMaterialsView({ parts, materials }) {
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
                      <>
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
                      </>
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
