process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/index');

describe('Auth Endpoints', () => {
  it('should return health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'taskflow-gateway');
  });

  it('should reject login without credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toEqual(400);
  });

  it('should reject register without required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.statusCode).toEqual(400);
  });
});
