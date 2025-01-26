import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { LoginForm } from '../../../components/auth/LoginForm';

describe('LoginForm', () => {
  it('submits the form with email and password', async () => {
    const mockOnSuccess = jest.fn();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});