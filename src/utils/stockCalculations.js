/**
 * Stock Calculations Utilities
 * Provides functions for calculating volumes and weights of stock materials
 */

const StockCalculations = {
  // Calculate volume in cubic meters based on stock form and dimensions
  calculateVolume: (stockForm, dimensions) => {
    if (!stockForm || !dimensions) return 0;

    const d = dimensions;
    const PI = Math.PI;

    switch (stockForm) {
      case 'round_bar':
        // Volume = π × r² × length
        if (!d.diameter || !d.length) return 0;
        const radius = d.diameter / 2000; // mm to m
        const length = d.length / 1000; // mm to m
        return PI * radius * radius * length;

      case 'flat_bar':
        // Volume = width × thickness × length
        if (!d.width || !d.thickness || !d.length) return 0;
        return (d.width / 1000) * (d.thickness / 1000) * (d.length / 1000);

      case 'plate':
        // Volume = width × length × thickness
        if (!d.width || !d.length || !d.thickness) return 0;
        return (d.width / 1000) * (d.length / 1000) * (d.thickness / 1000);

      case 'hex_bar':
        // Volume = (3√3/2) × s² × length, where s is across flats / 2
        if (!d.across_flats || !d.length) return 0;
        const s = d.across_flats / 2000; // mm to m
        const hexLength = d.length / 1000; // mm to m
        return (3 * Math.sqrt(3) / 2) * s * s * hexLength;

      case 'tube':
        // Volume = π × (R² - r²) × length
        if (!d.outer_diameter || !d.wall_thickness || !d.length) return 0;
        const outerRadius = d.outer_diameter / 2000; // mm to m
        const innerRadius = (d.outer_diameter - 2 * d.wall_thickness) / 2000; // mm to m
        const tubeLength = d.length / 1000; // mm to m
        return PI * (outerRadius * outerRadius - innerRadius * innerRadius) * tubeLength;

      default:
        return 0;
    }
  },

  // Calculate weight in kg
  calculateWeight: (stockForm, dimensions, density) => {
    if (!density) return 0;
    const volume = StockCalculations.calculateVolume(stockForm, dimensions);
    return volume * density; // kg/m³ × m³ = kg
  },

  // Get dimension field labels for each stock form
  getDimensionFields: (stockForm) => {
    const fields = {
      round_bar: [
        { name: 'diameter', label: 'Diameter (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ],
      flat_bar: [
        { name: 'width', label: 'Width (mm)', type: 'number' },
        { name: 'thickness', label: 'Thickness (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ],
      plate: [
        { name: 'width', label: 'Width (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' },
        { name: 'thickness', label: 'Thickness (mm)', type: 'number' }
      ],
      hex_bar: [
        { name: 'across_flats', label: 'Across Flats (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ],
      tube: [
        { name: 'outer_diameter', label: 'Outer Diameter (mm)', type: 'number' },
        { name: 'wall_thickness', label: 'Wall Thickness (mm)', type: 'number' },
        { name: 'length', label: 'Length (mm)', type: 'number' }
      ]
    };
    return fields[stockForm] || [];
  }
};

export default StockCalculations;
