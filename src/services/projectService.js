import { supabase } from '../supabaseClient';

/**
 * Project Service
 * Handles all project-related database operations
 */

export const projectService = {
  /**
   * Get all projects with their notes
   */
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_notes (*)')
      .is('deleted_at', null)
      .order('project_number', { ascending: false });
    return { data, error };
  },

  /**
   * Create a new project
   */
  async create(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update a project
   */
  async update(projectId, updates) {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);
    return { error };
  },

  /**
   * Soft delete a project
   */
  async delete(projectId) {
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId);
    return { error };
  },

  /**
   * Add a note to a project
   */
  async addNote(projectId, text, userId, userEmail) {
    const { data, error } = await supabase
      .from('project_notes')
      .insert({
        project_id: projectId,
        text: text,
        created_by: userId,
        created_by_email: userEmail
      })
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get all project check-ins
   */
  async getCheckins() {
    const { data, error } = await supabase
      .from('project_checkins')
      .select('*')
      .is('deleted_at', null)
      .order('checkin_date', { ascending: false });
    return { data, error };
  },

  /**
   * Get all check-in items
   */
  async getCheckinItems() {
    const { data, error } = await supabase
      .from('checkin_items')
      .select('*');
    return { data, error };
  },

  /**
   * Delete a check-in
   */
  async deleteCheckin(checkinId) {
    const { error } = await supabase
      .from('project_checkins')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', checkinId);
    return { error };
  },

  /**
   * Get all delivery notes
   */
  async getDeliveryNotes() {
    const { data, error } = await supabase
      .from('delivery_notes')
      .select('*')
      .is('deleted_at', null)
      .order('delivery_date', { ascending: false });
    return { data, error };
  },

  /**
   * Get all delivery note items
   */
  async getDeliveryNoteItems() {
    const { data, error } = await supabase
      .from('delivery_note_items')
      .select('*');
    return { data, error };
  },

  /**
   * Delete a delivery note
   */
  async deleteDeliveryNote(deliveryNoteId) {
    const { error } = await supabase
      .from('delivery_notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deliveryNoteId);
    return { error };
  }
};

export default projectService;
