import { useState } from 'react';
import Icons from '../components/common/Icons';

export default function ContactsView({ contacts, projects, parts, onAddContact, onUpdateContact, onDeleteContact }) {
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'customers', 'suppliers'
  const [searchQuery, setSearchQuery] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    is_customer: true,
    is_supplier: false
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Filter contacts by role
  const filteredContacts = contacts.filter(contact => {
    const matchesRole = roleFilter === 'all' ||
                       (roleFilter === 'customers' && contact.is_customer) ||
                       (roleFilter === 'suppliers' && contact.is_supplier);
    const matchesSearch = !searchQuery ||
                         contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (contact.contact && contact.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Calculate stats
  const stats = {
    total: contacts.length,
    customers: contacts.filter(c => c.is_customer).length,
    suppliers: contacts.filter(c => c.is_supplier).length,
    both: contacts.filter(c => c.is_customer && c.is_supplier).length
  };

  const handleAdd = () => {
    if (!newContact.name) return;
    if (!newContact.is_customer && !newContact.is_supplier) {
      alert('Contact must be marked as either Customer or Supplier (or both)');
      return;
    }
    onAddContact(newContact);
    setNewContact({ name: '', contact: '', email: '', phone: '', address: '', is_customer: true, is_supplier: false });
  };

  const startEdit = (contact) => {
    setEditingId(contact.id);
    setEditData({ ...contact });
  };

  const saveEdit = () => {
    if (!editData.is_customer && !editData.is_supplier) {
      alert('Contact must be marked as either Customer or Supplier (or both)');
      return;
    }
    onUpdateContact(editingId, editData);
    setEditingId(null);
  };

  const getProjectCount = (contactId) => projects.filter(p => p.customer_id === contactId).length;
  const getActiveProjectCount = (contactId) => projects.filter(p => p.customer_id === contactId && p.status !== 'completed').length;
  const getTotalValue = (contactId) => projects.filter(p => p.customer_id === contactId).reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
  const getPartCount = (contactId) => parts.filter(p => p.supplier_id === contactId).length;

  const getRoleBadge = (contact) => {
    if (contact.is_customer && contact.is_supplier) {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>Customer</span>
          <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', color: 'var(--accent-orange)' }}>Supplier</span>
        </div>
      );
    } else if (contact.is_customer) {
      return <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>Customer</span>;
    } else {
      return <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(251,146,60,0.15)', color: 'var(--accent-orange)' }}>Supplier</span>;
    }
  };

  const getSyncStatusBadge = (contact) => {
    if (contact.sync_status === 'synced') {
      return <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '8px', background: 'rgba(52,211,153,0.15)', color: 'var(--accent-green)' }} title="Synced with Xero">Xero</span>;
    } else if (contact.sync_status === 'pending_push') {
      return <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '8px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }} title="Pending sync to Xero">Pending</span>;
    }
    return null; // local_only doesn't show badge
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage customers, suppliers, and Xero integration</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.customers}</div>
          <div className="stat-card-label">Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--accent-orange)' }}>{stats.suppliers}</div>
          <div className="stat-card-label">Suppliers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{stats.both}</div>
          <div className="stat-card-label">Both Roles</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-box">
        <Icons.Search />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-row" style={{ marginBottom: 24 }}>
        <button
          className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
          onClick={() => setRoleFilter('all')}
        >
          All<span className="count">{stats.total}</span>
        </button>
        <button
          className={`filter-btn ${roleFilter === 'customers' ? 'active' : ''}`}
          onClick={() => setRoleFilter('customers')}
        >
          Customers<span className="count">{stats.customers}</span>
        </button>
        <button
          className={`filter-btn ${roleFilter === 'suppliers' ? 'active' : ''}`}
          onClick={() => setRoleFilter('suppliers')}
        >
          Suppliers<span className="count">{stats.suppliers}</span>
        </button>
      </div>

      {/* Add Contact Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Add New Contact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Company name"
              value={newContact.name}
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              className="form-input"
              placeholder="Name"
              value={newContact.contact}
              onChange={e => setNewContact({ ...newContact, contact: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="email@company.com"
              value={newContact.email}
              onChange={e => setNewContact({ ...newContact, email: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-input"
              placeholder="Phone number"
              value={newContact.phone}
              onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Business address"
              value={newContact.address}
              onChange={e => setNewContact({ ...newContact, address: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={newContact.is_customer}
              onChange={e => setNewContact({ ...newContact, is_customer: e.target.checked })}
            />
            <span>Customer</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={newContact.is_supplier}
              onChange={e => setNewContact({ ...newContact, is_supplier: e.target.checked })}
            />
            <span>Supplier</span>
          </label>
          <button className="btn btn-primary" onClick={handleAdd} style={{ marginLeft: 'auto' }}>
            <Icons.Plus /> Add Contact
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role(s)</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Usage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => {
              const projectCount = getProjectCount(contact.id);
              const activeCount = getActiveProjectCount(contact.id);
              const totalValue = getTotalValue(contact.id);
              const partCount = getPartCount(contact.id);
              const isEditing = editingId === contact.id;

              if (isEditing) {
                return (
                  <tr key={contact.id}>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={editData.is_customer}
                            onChange={e => setEditData({ ...editData, is_customer: e.target.checked })}
                          />
                          Customer
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={editData.is_supplier}
                            onChange={e => setEditData({ ...editData, is_supplier: e.target.checked })}
                          />
                          Supplier
                        </label>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={editData.contact || ''}
                        onChange={e => setEditData({ ...editData, contact: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        className="form-input"
                        value={editData.email || ''}
                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={editData.phone || ''}
                        onChange={e => setEditData({ ...editData, phone: e.target.value })}
                        style={{ padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      {contact.is_customer && <div>{projectCount} projects</div>}
                      {contact.is_supplier && <div>{partCount} parts</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost"
                          onClick={saveEdit}
                          style={{ color: 'var(--accent-green)' }}
                        >
                          <Icons.Check />
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <Icons.X />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={contact.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <strong>{contact.name}</strong>
                      {getSyncStatusBadge(contact)}
                    </div>
                  </td>
                  <td>{getRoleBadge(contact)}</td>
                  <td>{contact.contact || '-'}</td>
                  <td>
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} style={{ color: 'var(--accent-blue)' }}>
                        {contact.email}
                      </a>
                    ) : '-'}
                  </td>
                  <td>{contact.phone || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13 }}>
                      {contact.is_customer && (
                        <div>
                          {projectCount} project{projectCount !== 1 ? 's' : ''}
                          {activeCount > 0 && (
                            <span style={{ color: 'var(--accent-orange)', marginLeft: 4 }}>
                              ({activeCount} active)
                            </span>
                          )}
                          {totalValue > 0 && (
                            <div style={{ fontFamily: 'monospace', color: 'var(--accent-green)', fontSize: 12 }}>
                              £{totalValue.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                      {contact.is_supplier && (
                        <div>{partCount} part{partCount !== 1 ? 's' : ''}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-ghost"
                        onClick={() => startEdit(contact)}
                      >
                        <Icons.Pencil />
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => onDeleteContact(contact.id)}
                        disabled={(contact.is_customer && projectCount > 0) || (contact.is_supplier && partCount > 0)}
                        style={{ opacity: ((contact.is_customer && projectCount > 0) || (contact.is_supplier && partCount > 0)) ? 0.3 : 1 }}
                      >
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

      {filteredContacts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          No contacts found
        </div>
      )}
    </>
  );
}
