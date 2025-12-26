import { useState, useEffect } from 'react';
import partService from '../services/partService';

/**
 * Custom hook for managing parts and part revisions
 * @returns {Object} Parts data, revisions, loading state, error state, and refetch function
 */
export default function useParts() {
  const [parts, setParts] = useState([]);
  const [partRevisions, setPartRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParts = async () => {
    setLoading(true);
    setError(null);

    try {
      const [partsResult, revisionsResult] = await Promise.all([
        partService.getAll(),
        partService.getRevisions()
      ]);

      setParts(partsResult.data || []);
      setPartRevisions(revisionsResult.data || []);
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
    loading,
    error,
    refetch: fetchParts
  };
}
