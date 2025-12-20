              {project.actual_finish_date ? formatDate(project.actual_finish_date) : '-'}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Value</div>
            {isEditing ? (
              <input
                type="number"
                className="form-input"
                value={editData.value}
                onChange={e => setEditData({ ...editData, value: e.target.value })}
              />
            ) : (
              <div className="info-value money">£{parseFloat(project.value || 0).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Update Status</div>
          <div className="status-buttons">
            <button
              className={`btn ${project.status === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleStatusChange('in-progress')}
            >
              In Progress
            </button>
            <button
              className={`btn ${project.status === 'on-hold' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleStatusChange('on-hold')}
              style={project.status === 'on-hold' ? { background: '#fbbf24', borderColor: '#fbbf24' } : {}}
            >
              On Hold
            </button>
            <button
              className={`btn ${project.status === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleStatusChange('completed')}
              style={project.status === 'completed' ? { background: 'var(--accent-green)', borderColor: 'var(--accent-green)' } : {}}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="notes-section">
          <div className="notes-header">
            <div className="notes-title">
              <Icons.FileText /> Project Notes
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No notes yet
              </div>
            ) : (
              [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(note => (
                <div key={note.id} className="note-item">
                  <div className="note-timestamp">{formatDateTime(note.created_at)}</div>
                  <div className="note-text">{note.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="add-note-form">
            <textarea
              className="form-input"
              placeholder="Add a note..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddNote();
                }
              }}
            />
            <button className="btn btn-primary" onClick={handleAddNote} disabled={!newNote.trim()}>
              <Icons.Plus /> Add Note
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// CUSTOMERS VIEW
// ============================================
function CustomersView({ customers, projects, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) {
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = () => {
    if (!newCustomer.name) return;
    onAddCustomer(newCustomer);
    setNewCustomer({ name: '', contact: '', email: '', phone: '' });
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setEditData({ ...customer });
  };

  const saveEdit = () => {
    onUpdateCustomer(editingId, editData);
    setEditingId(null);
  };

  const getProjectCount = (customerId) => projects.filter(p => p.customer_id === customerId).length;
  const getActiveProjectCount = (customerId) => projects.filter(p => p.customer_id === customerId && p.status !== 'completed').length;
  const getTotalValue = (customerId) => projects.filter(p => p.customer_id === customerId).reduce((sum, p) => sum + parseFloat(p.value || 0), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage customer information</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Company name"
              value={newCustomer.name}
              onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              className="form-input"
              placeholder="Name"
              value={newCustomer.contact}
              onChange={e => setNewCustomer({ ...newCustomer, contact: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="email@company.com"
              value={newCustomer.email}
              onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-input"
              placeholder="Phone number"
              value={newCustomer.phone}
              onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Icons.Plus /> Add Customer
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Projects</th>
              <th>Total Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => {
              const projectCount = getProjectCount(customer.id);
              const activeCount = getActiveProjectCount(customer.id);
              const totalValue = getTotalValue(customer.id);
              const isEditing = editingId === customer.id;

              if (isEditing) {
                return (
                  <tr key={customer.id}>
                    <td>
                      <input type="text" className="form-input" value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        style={{ padding: '6px 10px' }} />
                    </td>
                    <td>
                      <input type="text" className="form-input" value={editData.contact || ''}
                        onChange={e => setEditData({ ...editData, contact: e.target.value })}
                        style={{ padding: '6px 10px' }} />
                    </td>
                    <td>
                      <input type="email" className="form-input" value={editData.email || ''}
                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                        style={{ padding: '6px 10px' }} />
                    </td>
                    <td>
                      <input type="text" className="form-input" value={editData.phone || ''}
                        onChange={e => setEditData({ ...editData, phone: e.target.value })}
                        style={{ padding: '6px 10px' }} />
                    </td>
                    <td>{projectCount}</td>
                    <td>£{totalValue.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" onClick={saveEdit} style={{ color: 'var(--accent-green)' }}>
                          <Icons.Check />
                        </button>
                        <button className="btn btn-ghost" onClick={() => setEditingId(null)}>
                          <Icons.X />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.contact}</td>
                  <td>
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} style={{ color: 'var(--accent-blue)' }}>
                        {customer.email}
                      </a>
                    )}
                  </td>
                  <td>{customer.phone}</td>
                  <td>
                    {projectCount} total
                    {activeCount > 0 && <span style={{ color: 'var(--accent-orange)', marginLeft: 4 }}>({activeCount} active)</span>}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-green)' }}>
                    £{totalValue.toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost" onClick={() => startEdit(customer)}>
                        <Icons.Pencil />
                      </button>
                      <button className="btn btn-ghost" onClick={() => onDeleteCustomer(customer.id)}
                        disabled={projectCount > 0} style={{ opacity: projectCount > 0 ? 0.3 : 1 }}>
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
    </>
  );
}

// ============================================
// ADD PROJECT MODAL
// ============================================
function AddProjectModal({ customers, nextProjectNumber, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    dateStarted: new Date().toISOString().split('T')[0],
    dueDate: '',
    value: ''
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  const filteredCustomers = customerSearch.length > 0
    ? customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.contact && c.contact.toLowerCase().includes(customerSearch.toLowerCase()))
      )
    : customers;

  const handleCustomerSelect = (customer) => {
    setFormData({ ...formData, customerId: customer.id });
    setCustomerSearch('');
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.customerId || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Icons.Briefcase />
            New Project
          </h2>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <div className="modal-body">
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Project Number:</span>
            <span className="project-number" style={{ fontSize: 16 }}>#{nextProjectNumber}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Front Suspension Development"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer *</label>
            {selectedCustomer ? (
              <div className="autocomplete-selected">
                <span style={{ fontWeight: 500 }}>{selectedCustomer.name}</span>
                {selectedCustomer.contact && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({selectedCustomer.contact})</span>
                )}
                <button onClick={() => setFormData({ ...formData, customerId: '' })}>
                  <Icons.X />
                </button>
              </div>
            ) : (
              <div className="autocomplete-container">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Start typing to search customers..."
                  value={customerSearch}
                  onChange={e => {
                    setCustomerSearch(e.target.value);
                    setShowDropdown(true);
                    setHighlightedIndex(0);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && (
                  <div className="autocomplete-dropdown">
                    {filteredCustomers.slice(0, 10).map((customer, index) => (
                      <div
                        key={customer.id}
                        className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                        onClick={() => handleCustomerSelect(customer)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <div className="autocomplete-item-name">{customer.name}</div>
                        {customer.contact && (
                          <div className="autocomplete-item-detail">{customer.contact}</div>
                        )}
                      </div>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No customers found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date Started *</label>
              <input
                type="date"
                className="form-input"
                value={formData.dateStarted}
                onChange={e => setFormData({ ...formData, dateStarted: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Value (£)</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={formData.value}
              onChange={e => setFormData({ ...formData, value: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Icons.Check /> Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP EXPORT
// ============================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ color: '#a1a1a6' }}>Loading...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <LoginPage onLogin={setUser} />
      </>
    );
  }

  return <MainApp user={user} onLogout={handleLogout} />;
}
