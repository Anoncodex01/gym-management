import React, { useState, useEffect } from 'react';
import { MembershipPlan } from '../../types/membership.types';
import { membershipApi } from '../../services/api/membership.api';

export const PlanSelection: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingFrequency, setBillingFrequency] = useState<string>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await membershipApi.getPlans();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Billing Frequency Selection */}
        <div className="mt-8">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Select Billing Frequency</h3>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {['monthly', 'quarterly', 'semi-annually', 'annually'].map((frequency) => (
              <button
                key={frequency}
                onClick={() => setBillingFrequency(frequency)}
                className={`px-4 py-2 border rounded-md ${
                  billingFrequency === frequency
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Membership Plans */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg shadow-sm p-6 ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-gray-500">{plan.description}</p>
              <p className="mt-4 text-3xl font-bold text-gray-900">
                ${plan.price}
                <span className="text-base font-normal text-gray-500">/{billingFrequency}</span>
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};