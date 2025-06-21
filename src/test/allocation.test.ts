import request from 'supertest';
import app from '../app'; // Express app burada export edilmeli

describe('POST /api/allocate', () => {
  it('should return a valid allocation with weights', async () => {
    const response = await request(app)
      .post('/api/allocate')
      .send({ amount: 1000, durationDays: 7 });

    expect(response.status).toBe(200);
    expect(response.body.allocation).toBeDefined();
    expect(response.body.allocation.length).toBeGreaterThan(0);
  });
});
