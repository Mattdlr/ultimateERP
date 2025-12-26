import { useState, useEffect } from 'react';
import operationService from '../services/operationService';

/**
 * Custom hook for managing manufacturing operations
 * @returns {Object} Operations data, loading state, error state, and refetch function
 */
export default function useOperations() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOperations = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await operationService.getAll();
      setOperations(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching operations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  return {
    operations,
    loading,
    error,
    refetch: fetchOperations
  };
}
