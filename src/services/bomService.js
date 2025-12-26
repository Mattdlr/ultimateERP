import { supabase } from '../supabaseClient';

/**
 * BOM (Bill of Materials) Service
 * Handles all BOM relations database operations
 */

export const bomService = {
  /**
   * Get all BOM relations
   */
  async getAll() {
    const { data, error } = await supabase
      .from('bom_relations')
      .select('*');
    return { data, error };
  },

  /**
   * Add a BOM item
   */
  async create(bomData) {
    const { data, error } = await supabase
      .from('bom_relations')
      .insert(bomData)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update a BOM item
   */
  async update(bomId, updates) {
    const { error } = await supabase
      .from('bom_relations')
      .update(updates)
      .eq('id', bomId);
    return { error };
  },

  /**
   * Delete a BOM item
   */
  async delete(bomId) {
    const { error } = await supabase
      .from('bom_relations')
      .delete()
      .eq('id', bomId);
    return { error };
  }
};

export default bomService;
