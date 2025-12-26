import { useState } from 'react';
import Icons from '../common/Icons';

export default function AddProjectModal({ customers, nextProjectNumber, onClose, onSave }) {
  const [formData, setFormData] = useState({ title: '', customerId: '', dateStarted: new Date().toISOString().split('T')[0], dueDate: '', value: '' });
  const [customerSearch, setCustomerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [numberOfCopies, setNumberOfCopies] = useState(1);
  const [createAnother, setCreateAnother] = useState(false);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const filteredCustomers = customerSearch.length > 0 ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.contact && c.contact.toLowerCase().includes(customerSearch.toLowerCase()))) : customers;

  const handleCustomerSelect = (customer) => { setFormData({ ...formData, customerId: customer.id }); setCustomerSearch(''); setShowDropdown(false); };

  const handleSubmit = () => {
    if (!formData.title || !formData.customerId || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Save the project (or multiple copies)
    onSave(formData, numberOfCopies);

    // If creating multiple projects, always close
    if (numberOfCopies > 1) {
      onClose();
    }
    // If "Create Another" is checked (and creating single project), reset form but keep customer
    else if (createAnother) {
      setFormData({
        title: '',
        customerId: formData.customerId,
        dateStarted: new Date().toISOString().split('T')[0],
        dueDate: '',
        value: ''
      });
      setNumberOfCopies(1);
      setCreateAnother(false);
    } else {
      onClose();
    }
  };

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

          {/* Duplication Options */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, marginTop: 20 }}>
            <div className="form-group">
              <label className="form-label">Number of Copies</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="10"
                value={numberOfCopies}
                onChange={e => setNumberOfCopies(parseInt(e.target.value) || 1)}
                style={{ width: 100 }}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Create {numberOfCopies} identical project{numberOfCopies > 1 ? 's' : ''} with sequential project numbers
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={createAnother}
                  onChange={e => setCreateAnother(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span>Create another project with this customer after saving</span>
              </label>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginLeft: 24 }}>
                Keep modal open and reset form for creating similar projects
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}><Icons.Check /> Create Project{numberOfCopies > 1 ? 's' : ''}</button></div>
      </div>
    </div>
  );
}
