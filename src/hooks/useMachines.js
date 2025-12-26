import { useState, useEffect } from 'react';
import machineService from '../services/machineService';

/**
 * Custom hook for managing machines
 * @returns {Object} Machines data, loading state, error state, and refetch function
 */
export default function useMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMachines = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await machineService.getAll();
      setMachines(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return {
    machines,
    loading,
    error,
    refetch: fetchMachines
  };
}
