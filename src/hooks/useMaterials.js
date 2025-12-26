import { useState, useEffect } from 'react';
import materialService from '../services/materialService';

/**
 * Custom hook for managing materials
 * @returns {Object} Materials data, loading state, error state, and refetch function
 */
export default function useMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await materialService.getAll();
      setMaterials(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    error,
    refetch: fetchMaterials
  };
}
