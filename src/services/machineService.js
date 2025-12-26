import { supabase } from '../supabaseClient';

/**
 * Machine Service
 * Handles all machine-related database operations
 */

export const machineService = {
  /**
   * Get all machines
   */
  async getAll() {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('name');
    return { data, error };
  },

  /**
   * Create a new machine
   */
  async create(machineData) {
    const { data, error } = await supabase
      .from('machines')
      .insert(machineData)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update a machine
   */
  async update(machineId, updates) {
    const { error } = await supabase
      .from('machines')
      .update(updates)
      .eq('id', machineId);
    return { error };
  },

  /**
   * Soft delete a machine
   */
  async delete(machineId) {
    const { error } = await supabase
      .from('machines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', machineId);
    return { error };
  }
};

export default machineService;
