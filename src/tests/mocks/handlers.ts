import { rest } from 'msw';

export const handlers = [
  // Auth handlers
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
        },
      })
    );
  }),

  // Membership handlers
  rest.get('/api/membership/plans', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          type: 'single',
          name: 'Basic Plan',
          price: 49.99,
        },
      ])
    );
  }),

  // Class handlers
  rest.get('/api/classes', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Yoga Class',
          instructor: 'John Doe',
          startTime: new Date().toISOString(),
        },
      ])
    );
  }),
];