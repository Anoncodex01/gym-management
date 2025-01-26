import { BillingConfig } from '../../types/payment.types';

export const billingConfig: BillingConfig = {
  frequencies: [
    { type: 'monthly', monthsInterval: 1, amount: 50000, discountPercentage: 0 },
    { type: 'quarterly', monthsInterval: 3, amount: 140000, discountPercentage: 7 },
    { type: 'semi-annually', monthsInterval: 6, amount: 270000, discountPercentage: 10 },
    { type: 'annually', monthsInterval: 12, amount: 500000, discountPercentage: 15 }
  ],
  basePrice: {
    single: 50000,
    couple: 80000,
    corporate: 40000
  },
  insuranceDiscount: 15,
  dayPassPrice: 10000,
  tenDayPassPrice: 80000
};