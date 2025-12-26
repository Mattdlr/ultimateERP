import { useState, useEffect } from 'react';
import projectService from '../services/projectService';

/**
 * Custom hook for managing projects, check-ins, and delivery notes
 * @returns {Object} Projects data, loading state, error state, and refetch function
 */
export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [checkinItems, setCheckinItems] = useState([]);
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [deliveryNoteItems, setDeliveryNoteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        projectsResult,
        checkinsResult,
        checkinItemsResult,
        deliveryNotesResult,
        deliveryNoteItemsResult
      ] = await Promise.all([
        projectService.getAll(),
        projectService.getCheckins(),
        projectService.getCheckinItems(),
        projectService.getDeliveryNotes(),
        projectService.getDeliveryNoteItems()
      ]);

      setProjects(projectsResult.data || []);
      setCheckins(checkinsResult.data || []);
      setCheckinItems(checkinItemsResult.data || []);
      setDeliveryNotes(deliveryNotesResult.data || []);
      setDeliveryNoteItems(deliveryNoteItemsResult.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    checkins,
    checkinItems,
    deliveryNotes,
    deliveryNoteItems,
    loading,
    error,
    refetch: fetchProjects
  };
}
