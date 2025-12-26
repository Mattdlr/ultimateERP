import { supabase } from '../supabaseClient';

/**
 * Contact Service
 * Handles all contact (customers & suppliers) database operations
 */

export const contactService = {
  /**
   * Get all contacts
   */
  async getAll() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name');
    return { data, error };
  },

  /**
   * Create a new contact
   */
  async create(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update a contact
   */
  async update(contactId, updates) {
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', contactId);
    return { error };
  },

  /**
   * Soft delete a contact
   */
  async delete(contactId) {
    const { error } = await supabase
      .from('contacts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', contactId);
    return { error };
  }
};

export default contactService;
