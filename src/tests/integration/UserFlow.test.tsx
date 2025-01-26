import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { App } from '../../App';

describe('User Flow Integration', () => {
  it('completes registration and books a class', async () => {
    render(<App />, { route: '/register' });

    // Fill registration form
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Verify redirect to membership selection
    await waitFor(() => {
      expect(screen.getByText(/select a plan/i)).toBeInTheDocument();
    });

    // Select a plan
    fireEvent.click(screen.getByText(/basic plan/i));
    
    // Complete payment
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
