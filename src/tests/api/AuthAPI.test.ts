import { authApi } from '../../services/api/auth.api';

describe('Auth API', () => {
  it('successfully logs in user', async () => {
    const response = await authApi.login('test@example.com', 'password123');
    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('user');
  });
});
