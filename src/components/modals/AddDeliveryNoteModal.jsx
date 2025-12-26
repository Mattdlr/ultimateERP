import { useState } from 'react';
import Icons from '../common/Icons';

export default function AddDeliveryNoteModal({ projectId, parts, checkinItems, onClose, onSave }) {
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
