import { GymPackage, gymPackages } from '../../types/package.types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface PackageSelectionProps {
  onSelect: (pkg: GymPackage) => void;
  selectedPackage?: GymPackage;
}

const durationDisplay = {
  'monthly': '1 Month',
  'quarterly': '3 Months',
  'semi-annually': '6 Months',
  'annually': '12 Months'
};

export function PackageSelection({ onSelect, selectedPackage }: PackageSelectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {gymPackages.map((pkg) => (
        <Card
          key={pkg.id}
          className={`relative overflow-hidden cursor-pointer transition-all ${
            selectedPackage?.id === pkg.id
              ? 'ring-2 ring-primary'
              : 'hover:shadow-lg'
          }`}
          onClick={() => onSelect(pkg)}
        >
          {pkg.discountPercentage && (
            <div className="absolute top-2 right-2">
              <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                {pkg.discountPercentage}% OFF
              </span>
            </div>
          )}
          
          <div className="p-6">
            <div className="text-2xl font-bold mb-2">
              {durationDisplay[pkg.duration]}
            </div>
            
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">
                {(pkg.price / 1000).toFixed(0)}k
              </span>
              <span className="text-sm text-muted-foreground">
                TZS
              </span>
            </div>

            <Button
              variant={selectedPackage?.id === pkg.id ? "default" : "outline"}
              className="w-full"
              onClick={() => onSelect(pkg)}
            >
              Select
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
