import { Raffle } from './types';

// Pricing calculation supporting combos (e.g. 2 x RD$500 when unit is RD$300)
export function calculateRafflePrice(raffle: Raffle, count: number): { total: number; discount: number } {
  const unitPrice = raffle.pricePerTicket;
  const normalTotal = count * unitPrice;

  if (raffle.comboQty && raffle.comboPrice && raffle.comboQty > 1 && raffle.comboPrice > 0) {
    const pairs = Math.floor(count / raffle.comboQty);
    const remainder = count % raffle.comboQty;
    const discountedTotal = (pairs * raffle.comboPrice) + (remainder * unitPrice);
    const discount = Math.max(0, normalTotal - discountedTotal);
    return { total: discountedTotal, discount };
  }

  return { total: normalTotal, discount: 0 };
}
