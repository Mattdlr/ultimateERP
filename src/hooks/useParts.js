import { useState, useEffect } from 'react';
import partService from '../services/partService';

/**
 * Custom hook for managing parts, part revisions, and part-customer relationships
 * @returns {Object} Parts data, revisions, part-customers, loading state, error state, and refetch function
 */
export default function useParts() {
  const [parts, setParts] = useState([]);
  const [partRevisions, setPartRevisions] = useState([]);
  const [partCustomers, setPartCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParts = async () => {
    setLoading(true);
    setError(null);

    try {
      const [partsResult, revisionsResult, partCustomersResult] = await Promise.all([
        partService.getAll(),
        partService.getRevisions(),
        partService.getPartCustomers()
      ]);

      setParts(partsResult.data || []);
      setPartRevisions(revisionsResult.data || []);
      setPartCustomers(partCustomersResult.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching parts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  return {
    parts,
    partRevisions,
    partCustomers,
    loading,
    error,
    refetch: fetchParts
  };
}
