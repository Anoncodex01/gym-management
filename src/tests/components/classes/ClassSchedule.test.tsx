import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import { ClassSchedule } from '../../../components/classes/ClassSchedule';

describe('ClassSchedule', () => {
  it('loads and displays classes', async () => {
    render(<ClassSchedule />);
    
    await waitFor(() => {
      expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    });
  });
});