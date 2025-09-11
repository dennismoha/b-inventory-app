import prisma from '@src/shared/prisma/prisma-client';
import { BadRequestError, NotFoundError } from './error-handler';
export const utilMessage = {
  fetchedMessage: function (resource: string) {
    return `${resource} fetched Succesfuly`;
  },
  updateMessage: function (resource: string) {
    return `${resource} updated Succesfuly`;
  },
  created: function (resource: string) {
    return `${resource} created Succesfuly`;
  },
  deleted: function (resource: string) {
    return `${resource} created Succesfuly`;
  },
  duplicateMessage: function (resource: string) {
    return `${resource} exists`;
  }
};

/**
 * Calculate the total of products and miscellaneous charges and check if it exceeds the total order amount.
 * @param orderId The order ID for which the calculation is to be done.
 * @param totalAmount The total amount set for the order.
 * @returns A promise that resolves to a boolean indicating whether the total exceeds the order amount.
 */
export const calculateTotalAndCheckOrderAmount = async (orderId: string, totalAmount: number): Promise<boolean> => {
  // Fetch the related products for the order
  const orderProducts = await prisma.orderProducts.findMany({
    where: { orderId }
  });

  // Fetch the miscellaneous charges for the order
  const miscellaneous = await prisma.miscellaneous.findUnique({
    where: { order_id: orderId }
  });

  if (!orderProducts && !miscellaneous) {
    return false;
  }

  if (!orderProducts) {
    // Calculate the total of miscellaneous charges

    const totalMiscellaneous = miscellaneous ? parseFloat(miscellaneous.total_order_value.toString()) : 0;

    const calculatedTotal = 0 + totalMiscellaneous;

    // Check if the calculated total exceeds the order's total amount
    return calculatedTotal > totalAmount;
  }

  if (!miscellaneous) {
    const totalProductsAmount = orderProducts.reduce((total, product) => total + parseFloat(product.totalAmount.toString()), 0);
    const calculatedTotal = totalProductsAmount + 0;
    return calculatedTotal > totalAmount;
  }

  // Calculate the total of products and miscellaneous charges
  const totalProductsAmount = orderProducts.reduce((total, product) => total + parseFloat(product.totalAmount.toString()), 0);
  const totalMiscellaneous = miscellaneous ? parseFloat(miscellaneous.total_order_value.toString()) : 0;

  const calculatedTotal = totalProductsAmount + totalMiscellaneous;

  // Check if the calculated total exceeds the order's total amount
  return calculatedTotal > totalAmount;
};

/**
 * Conversion factors for common weight units.
 * These values represent the conversion rates between different weight units. The conversion factors are used to calculate
 * the equivalent weight in different units, depending on the context of the conversion (e.g., from kg to grams, or lb to grams).
 *
 * - 1 kilogram (kg) = 1000 grams (g)
 * - 1 gram (g) = 0.001 kilograms (kg)
 * - 1 pound (lb) = 453.59237 grams (g)
 * - 1 gram (g) = 0.00220462 pounds (lb)
 * - 1 milligram (mg) = 0.001 grams (g)
 * - 1 gram (g) = 1000 milligrams (mg)
 *
 * @const {Object} weightConversions - Weight conversion constants
 */
const weightConversions = {
  kgToG: 1000, // 1 kg = 1000 g
  gToKg: 1 / 1000, // 1 g = 0.001 kg
  lbToG: 453.59237, // 1 lb = 453.59237 g
  gToLb: 1 / 453.59237, // 1 g = 0.00220462 lb
  mgToG: 1 / 1000, // 1 mg = 0.001 g
  gToMg: 1000 // 1 g = 1000 mg
};

/**
 * Conversion factors for common length units.
 * These values represent the conversion rates between different length units. They allow us to convert from one unit to another.
 *
 * - 1 meter (m) = 100 centimeters (cm)
 * - 1 centimeter (cm) = 0.01 meters (m)
 * - 1 centimeter (cm) = 10 millimeters (mm)
 * - 1 millimeter (mm) = 0.1 centimeters (cm)
 * - 1 inch = 2.54 centimeters (cm)
 * - 1 centimeter (cm) = 0.393701 inches
 *
 * @const {Object} lengthConversions - Length conversion constants
 */
const lengthConversions = {
  mToCm: 100, // 1 m = 100 cm
  cmToM: 1 / 100, // 1 cm = 0.01 m
  cmToMm: 10, // 1 cm = 10 mm
  mmToCm: 1 / 10, // 1 mm = 0.1 cm
  inchToCm: 2.54, // 1 inch = 2.54 cm
  cmToInch: 1 / 2.54 // 1 cm = 0.393701 inch
};
/**
 * Conversion factors for common volume units.
 * These values represent the conversion rates between different volume units. They allow for conversion from liters to milliliters,
 * fluid ounces, etc., and vice versa.
 *
 * - 1 liter (l) = 1000 milliliters (ml)
 * - 1 milliliter (ml) = 0.001 liters (l)
 * - 1 fluid ounce (fl oz) = 29.5735 milliliters (ml)
 * - 1 milliliter (ml) = 0.033814 fluid ounces
 *
 * @const {Object} volumeConversions - Volume conversion constants
 */
const volumeConversions = {
  lToMl: 1000, // 1 l = 1000 ml
  mlToL: 1 / 1000, // 1 ml = 0.001 l
  flOzToMl: 29.5735, // 1 fl oz = 29.5735 ml
  mlToFlOz: 1 / 29.5735 // 1 ml = 0.033814 fl oz
};

/**
 * Identifies the category of the unit (weight, length, or volume).
 * This function takes a unit (e.g., 'kg', 'cm', 'l') and checks which category it belongs to.
 * The categories help determine which conversion factors are applicable for a given unit.
 *
 * - If the unit is part of the weight category, it will return 'weight'.
 * - If the unit is part of the length category, it will return 'length'.
 * - If the unit is part of the volume category, it will return 'volume'.
 *
 * @param {string} unit - The unit for which the category is to be determined (e.g., 'kg', 'cm', 'l').
 * @returns {string} The category of the unit: 'weight', 'length', or 'volume'.
 * @throws {Error} If the unit is not recognized or doesn't match any known category.
 */
export function getUnitCategory(unit: string): string {
  if (['kg', 'g', 'lb', 'mg'].includes(unit)) {
    return 'weight';
  } else if (['m', 'cm', 'mm', 'inch'].includes(unit)) {
    return 'length';
  } else if (['l', 'ml', 'fl oz'].includes(unit)) {
    return 'volume';
  } else {
    throw new NotFoundError(`Unknown unit category for unit: ${unit}`);
  }
}

/**
 * Converts a value to and from its base unit, based on the unit category and the direction of conversion.
 * The function determines whether to perform a regular or inverse conversion, depending on whether we're converting
 * from the given unit to the base unit or from the base unit to the given unit.
 *
 * For example:
 * - Weight conversion: 5 kg -> 5000 g (regular), 5000 g -> 5 kg (inverse).
 * - Length conversion: 5 m -> 500 cm (regular), 500 cm -> 5 m (inverse).
 *
 * @param {number} value - The value to be converted (e.g., 5 kg, 100 cm).
 * @param {string} fromUnit - The unit of the given value (e.g., 'kg', 'm').
 * @param {string} unitCategory - The category of the unit (e.g., 'weight', 'length').
 * @param {boolean} inverse - Whether to perform the inverse conversion (true) or regular conversion (false).
 * @returns {number} - The converted value in the target unit.
 *
 * @throws {Error} Throws an error if the unitCategory is unsupported or the conversion is invalid.
 *
 * @example
 * // Convert 5 kg to grams in the weight category (regular conversion)
 * await convertToBaseUnit(5, 'kg', 'weight', false); // 5000
 *
 * // Convert 5000 g to kilograms in the weight category (inverse conversion)
 * await convertToBaseUnit(5000, 'g', 'weight', true); // 5
 */

type convertToBaseUnits = {
  convertedValue: number;
  baseUnit: string;
};

export async function convertToBaseUnit(
  value: number,
  fromUnit: string,
  unitCategory: string,
  inverse: boolean
): Promise<convertToBaseUnits> {
  let convertedValue: number;
  let baseUnit: string;

  // Check unit category for conversion
  if (unitCategory === 'weight') {
    baseUnit = 'g';
    // Weight conversion logic
    if (!inverse) {
      // Regular conversion
      if (fromUnit === 'kg') {
        convertedValue = value * 1000; // kg to grams (multiply by 1000)
      } else if (fromUnit === 'g') {
        convertedValue = value; // grams are already the base unit
      } else if (fromUnit === 'mg') {
        convertedValue = value / 1000; // mg to grams (divide by 1000)
      } else if (fromUnit === 'lb') {
        convertedValue = value * 453.592; // lb to grams (multiply by 453.592)
      } else {
        throw new Error(`Invalid unit for weight conversion: ${fromUnit}`);
      }
    } else {
      // Inverse conversion
      if (fromUnit === 'g') {
        convertedValue = value / 1000; // grams to kg (divide by 1000)
      } else if (fromUnit === 'kg') {
        convertedValue = value; // kg is the base unit, no change
      } else if (fromUnit === 'mg') {
        convertedValue = value * 1000; // mg to kg (multiply by 1000)
      } else if (fromUnit === 'lb') {
        convertedValue = value / 453.592; // grams to lb (divide by 453.592)
      } else {
        throw new Error(`Invalid unit for inverse weight conversion: ${fromUnit}`);
      }
    }
  } else if (unitCategory === 'length') {
    baseUnit = 'cm';
    // Length conversion logic
    if (!inverse) {
      // Regular conversion
      if (fromUnit === 'm') {
        convertedValue = value * 100; // meters to centimeters (multiply by 100)
      } else if (fromUnit === 'cm') {
        convertedValue = value; // centimeters are already the base unit
      } else if (fromUnit === 'mm') {
        convertedValue = value / 10; // millimeters to centimeters (divide by 10)
      } else if (fromUnit === 'in') {
        convertedValue = value * 2.54; // inches to centimeters (multiply by 2.54)
      } else {
        throw new Error(`Invalid unit for length conversion: ${fromUnit}`);
      }
    } else {
      // Inverse conversion
      if (fromUnit === 'cm') {
        convertedValue = value / 100; // cm to meters (divide by 100)
      } else if (fromUnit === 'm') {
        convertedValue = value; // meters are the base unit, no change
      } else if (fromUnit === 'mm') {
        convertedValue = value * 10; // mm to cm (multiply by 10)
      } else if (fromUnit === 'in') {
        convertedValue = value / 2.54; // cm to inches (divide by 2.54)
      } else {
        throw new Error(`Invalid unit for inverse length conversion: ${fromUnit}`);
      }
    }
  } else if (unitCategory === 'volume') {
    baseUnit = 'ml';
    // Volume conversion logic
    if (!inverse) {
      // Regular conversion
      if (fromUnit === 'l') {
        convertedValue = value * 1000; // liters to milliliters (multiply by 1000)
      } else if (fromUnit === 'ml') {
        convertedValue = value; // milliliters are already the base unit
      } else if (fromUnit === 'fl oz') {
        convertedValue = value * 29.5735; // fluid ounces to milliliters (multiply by 29.5735)
      } else {
        throw new Error(`Invalid unit for volume conversion: ${fromUnit}`);
      }
    } else {
      // Inverse conversion
      if (fromUnit === 'ml') {
        convertedValue = value / 1000; // milliliters to liters (divide by 1000)
      } else if (fromUnit === 'l') {
        convertedValue = value; // liters are the base unit, no change
      } else if (fromUnit === 'fl oz') {
        convertedValue = value / 29.5735; // milliliters to fluid ounces (divide by 29.5735)
      } else {
        throw new Error(`Invalid unit for inverse volume conversion: ${fromUnit}`);
      }
    }
  } else {
    throw new Error(`Unsupported unit category: ${unitCategory}`);
  }

  return { convertedValue, baseUnit };
}

// Regular conversions
//  console.log(await convertToBaseUnit(5, 'kg', 'weight', false)); // 5000 grams
//  console.log(await convertToBaseUnit(100, 'cm', 'length', false)); // 100 cm (no conversion)

/**
 * Converts a value from one unit to another based on predefined conversion factors.
 * This function performs the conversion by first determining the category of the units (weight, length, or volume).
 * It checks if the source and target units belong to the same category and then performs the conversion accordingly.
 *
 * The conversion is determined using either multiplication or division based on the conversion factors.
 *
 * @param {number} value - The value to be converted (e.g., 65, representing 65 kg).
 * @param {string} fromUnit - The unit to convert from (e.g., 'kg').
 * @param {string} toUnit - The unit to convert to (e.g., 'g').
 * @returns {number} - The converted value (e.g., 65000 for 65 kg to grams).
 * @throws {Error} - If the units are incompatible (e.g., trying to convert between weight and volume),
 * or if the conversion for the given units is not supported.
 */
export async function convert(value: number, fromUnit: string, toUnit: string): Promise<number> {
  const fromUnitCategory = getUnitCategory(fromUnit); // Get the category of the "from" unit
  const toUnitCategory = getUnitCategory(toUnit); // Get the category of the "to" unit

  if (fromUnitCategory !== toUnitCategory) {
    throw new BadRequestError(`Incompatible units: cannot convert between ${fromUnitCategory} and ${toUnitCategory}`);
  }
  // Handle weight conversions
  // Conversion logic for weight

  // Conversion logic for weight
  if (fromUnitCategory === 'weight') {
    if (fromUnit === 'kg' && toUnit === 'g') {
      return value * weightConversions.kgToG;
    } else if (fromUnit === 'g' && toUnit === 'kg') {
      return value * weightConversions.gToKg;
    } else if (fromUnit === 'g' && toUnit === 'lb') {
      return value * weightConversions.gToLb;
    } else if (fromUnit === 'lb' && toUnit === 'g') {
      return value * weightConversions.lbToG;
    } else if (fromUnit === 'mg' && toUnit === 'g') {
      return value * weightConversions.mgToG;
    } else if (fromUnit === 'g' && toUnit === 'mg') {
      return value * weightConversions.gToMg;
    } else {
      throw new Error(`Invalid weight conversion: ${fromUnit} to ${toUnit}`);
    }
  }

  // Conversion logic for length
  else if (fromUnitCategory === 'length') {
    if (fromUnit === 'm' && toUnit === 'cm') {
      return value * lengthConversions.mToCm;
    } else if (fromUnit === 'cm' && toUnit === 'm') {
      return value * lengthConversions.cmToM;
    } else if (fromUnit === 'cm' && toUnit === 'mm') {
      return value * lengthConversions.cmToMm;
    } else if (fromUnit === 'mm' && toUnit === 'cm') {
      return value * lengthConversions.mmToCm;
    } else if (fromUnit === 'inch' && toUnit === 'cm') {
      return value * lengthConversions.inchToCm;
    } else if (fromUnit === 'cm' && toUnit === 'inch') {
      return value * lengthConversions.cmToInch;
    } else {
      throw new Error(`Invalid length conversion: ${fromUnit} to ${toUnit}`);
    }
  }

  // Conversion logic for volume
  else if (fromUnitCategory === 'volume') {
    if (fromUnit === 'l' && toUnit === 'ml') {
      return value * volumeConversions.lToMl;
    } else if (fromUnit === 'ml' && toUnit === 'l') {
      return value * volumeConversions.mlToL;
    } else if (fromUnit === 'fl oz' && toUnit === 'ml') {
      return value * volumeConversions.flOzToMl;
    } else if (fromUnit === 'ml' && toUnit === 'fl oz') {
      return value * volumeConversions.mlToFlOz;
    } else {
      throw new BadRequestError(`Invalid volume conversion: ${fromUnit} to ${toUnit}`);
    }
  }

  // If no matching conversion was found
  else {
    throw new Error(`Unsupported unit category: ${fromUnitCategory}`);
  }

  // If no valid conversion is found, throw an error
  throw new NotFoundError('Invalid unit conversion');
}

/**
 * Converts a value from one unit to another using the inverse of the original conversion.
 * This is useful when needing to reverse the conversion (e.g., converting from grams to kilograms instead of kilograms to grams).
 *
 * The inverse conversion uses the same logic as `convert`, but swaps the source and target units.
 *
 * @param {number} value - The value to be converted (e.g., 65000 g).
 * @param {string} fromUnit - The unit to convert from (e.g., 'g').
 * @param {string} toUnit - The unit to convert to (e.g., 'kg').
 * @returns {number} - The converted value (e.g., 65 kg for 65000 g to kg).
 */
export async function inverseConvert(value: number, fromUnit: string, toUnit: string): Promise<number> {
  // Reverse the conversion direction by swapping 'fromUnit' and 'toUnit'
  return convert(value, toUnit, fromUnit);
}

// Example usage of the convert and inverseConvert functions
// console.log(convert(65, 'kg', 'g')); // 65000
// console.log(inverseConvert(65000, 'g', 'kg')); // 65

// console.log(convert(1, 'lb', 'g')); // 453.59237
// console.log(inverseConvert(453.59237, 'g', 'lb')); // 1

// console.log(convert(5, 'm', 'cm')); // 500
// console.log(inverseConvert(500, 'cm', 'm')); // 5

// console.log(convert(2, 'l', 'ml')); // 2000
// console.log(inverseConvert(2000, 'ml', 'l')); // 2
