import { useState, useEffect } from 'react';
import bomService from '../services/bomService';

/**
 * Custom hook for managing Bill of Materials (BOM) relations
 * @returns {Object} BOM relations data, loading state, error state, and refetch function
 */
export default function useBOM() {
  const [bomRelations, setBomRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBOM = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await bomService.getAll();
      setBomRelations(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching BOM:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBOM();
  }, []);

  return {
    bomRelations,
    loading,
    error,
    refetch: fetchBOM
  };
}
