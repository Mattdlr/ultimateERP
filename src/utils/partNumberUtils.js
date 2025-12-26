/**
 * Part Number Utilities
 * Provides functions for parsing, generating, and manipulating part numbers
 * Format: UL-XXXX-XX (e.g., UL-0001-01)
 */

const PartNumberUtils = {
  // Parse a part number into components
  parse: (partNumber) => {
    if (!partNumber) return null;
    const match = partNumber.match(/^UL-(\d{4})-(\d{2})$/);
    if (!match) return null;
    return {
      prefix: 'UL',
      number: parseInt(match[1], 10),
      revision: parseInt(match[2], 10),
      numberStr: match[1],
      revisionStr: match[2]
    };
  },

  // Generate the next available part number
  getNextPartNumber: (existingParts) => {
    let maxNumber = 0;

    existingParts.forEach(part => {
      const parsed = PartNumberUtils.parse(part.part_number);
      if (parsed && parsed.number > maxNumber) {
        maxNumber = parsed.number;
      }
    });

    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `UL-${nextNumber}-01`;
  },

  // Increment the revision of a part number
  incrementRevision: (partNumber) => {
    const parsed = PartNumberUtils.parse(partNumber);
    if (!parsed) return null;

    const newRevision = (parsed.revision + 1).toString().padStart(2, '0');
    return `UL-${parsed.numberStr}-${newRevision}`;
  },

  // Format a part number display with highlighting
  formatDisplay: (partNumber) => {
    const parsed = PartNumberUtils.parse(partNumber);
    if (!parsed) return partNumber;
    return {
      prefix: 'UL',
      number: parsed.numberStr,
      revision: parsed.revisionStr
    };
  }
};

export default PartNumberUtils;
