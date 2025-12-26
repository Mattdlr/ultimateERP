import { supabase } from '../supabaseClient';

/**
 * Material Service
 * Handles all material-related database operations
 */

export const materialService = {
  /**
   * Get all materials
   */
  async getAll() {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');
    return { data, error };
  },

  /**
   * Create a new material
   */
  async create(materialData) {
    const { data, error } = await supabase
      .from('materials')
      .insert(materialData)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update a material
   */
  async update(materialId, updates) {
    const { error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', materialId);
    return { error };
  },

  /**
   * Soft delete a material
   */
  async delete(materialId) {
    const { error } = await supabase
      .from('materials')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', materialId);
    return { error };
  }
};

export default materialService;
