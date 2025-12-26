import { useState, useEffect, useMemo } from 'react';
import contactService from '../services/contactService';

/**
 * Custom hook for managing contacts (customers and suppliers)
 * @returns {Object} Contacts data, filtered lists, loading state, error state, and refetch function
 */
export default function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await contactService.getAll();
      setContacts(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Memoized filtered lists for customers and suppliers
  const customers = useMemo(() =>
    contacts.filter(c => c.is_customer && !c.deleted_at),
    [contacts]
  );

  const suppliers = useMemo(() =>
    contacts.filter(c => c.is_supplier && !c.deleted_at),
    [contacts]
  );

  // Helper functions to get specific contacts
  const getCustomer = (customerId) => contacts.find(c => c.id === customerId);
  const getSupplier = (supplierId) => contacts.find(c => c.id === supplierId);

  return {
    contacts,
    customers,
    suppliers,
    getCustomer,
    getSupplier,
    loading,
    error,
    refetch: fetchContacts
  };
}
