/**
 * VenueKart Price Calculation Utilities
 * 
 * This module handles all price calculations for venues including:
 * - GST (18%)
 * - Platform Fee (10%)  
 * - New Launch Discount (10%)
 */

// Tax and fee constants
const GST_RATE = 0.18; // 18%
const PLATFORM_FEE_RATE = 0.10; // 10%
const NEW_LAUNCH_DISCOUNT_RATE = 0.10; // 10%

/**
 * Calculate the listing price (base + GST + platform fee)
 * This is the price shown on venue listing pages
 * 
 * @param {number} basePrice - The base price set by venue owner
 * @returns {number} Total price including GST and platform fee
 */
export const calculateListingPrice = (basePrice) => {
  if (!basePrice || basePrice <= 0) return 0;
  
  const gst = basePrice * GST_RATE;
  const platformFee = basePrice * PLATFORM_FEE_RATE;
  const totalPrice = basePrice + gst + platformFee;
  
  return Math.round(totalPrice);
};

/**
 * Calculate detailed price breakdown for venue details page
 *
 * @param {number} basePrice - The base price set by venue owner
 * @returns {object} Detailed price breakdown object
 */
export const calculatePriceBreakdown = (basePrice) => {
  if (!basePrice || basePrice <= 0) {
    return {
      basePrice: 0,
      gst: 0,
      platformFee: 0,
      subtotal: 0,
      discount: 0,
      finalPrice: 0,
      discountPercentage: PLATFORM_FEE_RATE * 100
    };
  }

  const gst = basePrice * GST_RATE;
  const platformFee = basePrice * PLATFORM_FEE_RATE;
  const subtotal = basePrice + gst + platformFee;
  const discount = platformFee; // Discount equals platform fee
  const finalPrice = subtotal - discount; // This equals basePrice + gst

  return {
    basePrice: Math.round(basePrice),
    gst: Math.round(gst),
    platformFee: Math.round(platformFee),
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    finalPrice: Math.round(finalPrice),
    discountPercentage: PLATFORM_FEE_RATE * 100
  };
};

/**
 * Format price with currency symbol and Indian locale
 *
 * @param {number} price - Price to format
 * @returns {string} Formatted price string with Indian currency system (xx,xx,xxx)
 */
export const formatPrice = (price) => {
  if (!price || price <= 0) return '₹0';

  // Ensure we have a number
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '₹0';

  // Use Indian locale for proper comma formatting (x,xx,xx,xxx)
  return `₹${numPrice.toLocaleString('en-IN')}`;
};

/**
 * Format price range with Indian currency system
 *
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {string} Formatted price range string
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return '₹0';
  if (!maxPrice || minPrice === maxPrice) return formatPrice(minPrice);
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

/**
 * Get pricing information for display
 * 
 * @param {number} basePrice - The base price
 * @param {string} displayType - 'listing' or 'detailed'
 * @returns {object} Pricing information for display
 */
export const getPricingInfo = (basePrice, displayType = 'listing') => {
  if (displayType === 'listing') {
    const listingPrice = calculateListingPrice(basePrice);
    return {
      displayPrice: listingPrice,
      formattedPrice: formatPrice(listingPrice),
      type: 'listing'
    };
  }
  
  if (displayType === 'detailed') {
    const breakdown = calculatePriceBreakdown(basePrice);
    return {
      ...breakdown,
      formattedBasePrice: formatPrice(breakdown.basePrice),
      formattedGst: formatPrice(breakdown.gst),
      formattedPlatformFee: formatPrice(breakdown.platformFee),
      formattedSubtotal: formatPrice(breakdown.subtotal),
      formattedDiscount: formatPrice(breakdown.discount),
      formattedFinalPrice: formatPrice(breakdown.finalPrice),
      type: 'detailed'
    };
  }
  
  throw new Error('Invalid display type. Use "listing" or "detailed"');
};

/**
 * Component for displaying price breakdown on venue details page
 * 
 * @param {number} basePrice - The base price
 * @returns {object} Price breakdown component data
 */
export const getPriceBreakdownComponent = (basePrice) => {
  const breakdown = calculatePriceBreakdown(basePrice);
  
  return {
    breakdown,
    items: [
      {
        label: 'Base Price',
        value: breakdown.basePrice,
        formatted: formatPrice(breakdown.basePrice),
        type: 'base'
      },
      {
        label: 'GST (18%)',
        value: breakdown.gst,
        formatted: formatPrice(breakdown.gst),
        type: 'tax'
      },
      {
        label: 'Platform Fee (10%)',
        value: breakdown.platformFee,
        formatted: formatPrice(breakdown.platformFee),
        type: 'fee'
      },
      {
        label: 'Subtotal',
        value: breakdown.subtotal,
        formatted: formatPrice(breakdown.subtotal),
        type: 'subtotal'
      },
      {
        label: `Platform Fee Waived (${breakdown.discountPercentage}%)`,
        value: -breakdown.discount,
        formatted: `-${formatPrice(breakdown.discount)}`,
        type: 'discount'
      },
      {
        label: 'Final Price',
        value: breakdown.finalPrice,
        formatted: formatPrice(breakdown.finalPrice),
        type: 'final'
      }
    ],
    discountNote: `Platform fee waived as new launch promotion.`
  };
};

// Export constants for external use
export const PRICING_CONSTANTS = {
  GST_RATE,
  PLATFORM_FEE_RATE,
  NEW_LAUNCH_DISCOUNT_RATE,
  GST_PERCENTAGE: GST_RATE * 100,
  PLATFORM_FEE_PERCENTAGE: PLATFORM_FEE_RATE * 100,
  DISCOUNT_PERCENTAGE: NEW_LAUNCH_DISCOUNT_RATE * 100
};
