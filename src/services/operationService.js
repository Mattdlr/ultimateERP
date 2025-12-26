import { supabase } from '../supabaseClient';

/**
 * Operation Service
 * Handles all manufacturing operation database operations
 */

export const operationService = {
  /**
   * Get all operations
   */
  async getAll() {
    const { data, error } = await supabase
      .from('operations')
      .select('*');
    return { data, error };
  },

  /**
   * Create a new operation
   */
  async create(operationData) {
    const { data, error } = await supabase
      .from('operations')
      .insert(operationData)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update an operation
   */
  async update(operationId, updates) {
    const { error } = await supabase
      .from('operations')
      .update(updates)
      .eq('id', operationId);
    return { error };
  },

  /**
   * Soft delete an operation
   */
  async delete(operationId) {
    const { error } = await supabase
      .from('operations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', operationId);
    return { error };
  }
};

export default operationService;
