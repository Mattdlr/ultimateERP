import { supabase } from '../supabaseClient';

/**
 * Part Service
 * Handles all part-related database operations
 */

export const partService = {
  /**
   * Get all parts
   */
  async getAll() {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('part_number');
    return { data, error };
  },

  /**
   * Create a new part
   */
  async create(partData) {
    const { data, error } = await supabase
      .from('parts')
      .insert(partData)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update a part
   */
  async update(partId, updates) {
    const { error } = await supabase
      .from('parts')
      .update(updates)
      .eq('id', partId);
    return { error };
  },

  /**
   * Soft delete a part
   */
  async delete(partId) {
    const { error } = await supabase
      .from('parts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', partId);
    return { error };
  },

  /**
   * Increment part revision - saves snapshot and updates part
   */
  async incrementRevision(partId, revisionSnapshot, newPartNumber, newRevisionNotes) {
    // Insert full revision snapshot
    const { error: revisionError } = await supabase
      .from('part_revisions')
      .insert(revisionSnapshot);

    if (revisionError) return { error: revisionError };

    // Update part with new revision number and notes
    const { error: updateError } = await supabase
      .from('parts')
      .update({
        part_number: newPartNumber,
        revision_notes: newRevisionNotes
      })
      .eq('id', partId);

    return { error: updateError };
  },

  /**
   * Get all part revisions
   */
  async getRevisions() {
    const { data, error } = await supabase
      .from('part_revisions')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

export default partService;
