
/**
 * Helper function to get current market price
 */
export const getMarketPrice = (instrument: string, orderType: 'buy' | 'sell'): number => {
  // In a real app, this would fetch the current market price
  // Here we generate a realistic mock price
  
  let basePrice;
  switch (instrument) {
    case 'BTCUSD':
      basePrice = 36500;
      break;
    case 'ETHUSD':
      basePrice = 2360;
      break;
    case 'EURUSD':
      basePrice = 1.0882;
      break;
    case 'USDJPY':
      basePrice = 151.45;
      break;
    case 'GBPUSD':
      basePrice = 1.2640;
      break;
    default:
      basePrice = 100;
  }
  
  // Add small spread
  return orderType === 'buy' ? basePrice * 1.0002 : basePrice * 0.9998;
};
