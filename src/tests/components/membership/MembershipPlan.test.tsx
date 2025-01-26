import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { MembershipPlan } from '../../../components/membership/MembershipPlan';

describe('MembershipPlan', () => {
  const mockPlan = {
    id: '1',
    type: 'single',
    name: 'Basic Plan',
    price: 49.99,
    features: ['Access to gym', '24/7 access'],
  };

  it('displays plan details correctly', () => {
    render(<MembershipPlan plan={mockPlan} />);
    expect(screen.getByText(mockPlan.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockPlan.price}`)).toBeInTheDocument();
  });
});