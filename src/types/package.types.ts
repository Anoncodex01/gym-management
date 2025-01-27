export type PackageDuration = 'monthly' | 'semi-annually' | 'annually';

export interface GymPackage {
  id: string;
  duration: PackageDuration;
  price: number;
  discountPercentage?: number;
  features?: string[];
}

export const gymPackages: GymPackage[] = [
  {
    id: 'monthly',
    duration: 'monthly',
    price: 50000,
    features: [
      'Full gym access',
      'Locker access',
      'Fitness assessment'
    ]
  },
  {
    id: 'semi-annual',
    duration: 'semi-annually',
    price: 250000,
    discountPercentage: 15,
    features: [
      'All monthly features',
      'Personal trainer consultation',
      'Nutrition guidance'
    ]
  },
  {
    id: 'annual',
    duration: 'annually',
    price: 450000,
    discountPercentage: 25,
    features: [
      'All semi-annual features',
      'Priority booking',
      'Free guest passes'
    ]
  }
];
