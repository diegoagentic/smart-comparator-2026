import request from 'supertest';
import app from '../server';

describe('Health Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe('healthy');
  });

  it('should include uptime and memory info', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('memory');
    expect(response.body.memory).toHaveProperty('used');
    expect(response.body.memory).toHaveProperty('total');
  });

  it('should include cache statistics', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body).toHaveProperty('cache');
    expect(response.body.cache).toHaveProperty('keys');
    expect(response.body.cache).toHaveProperty('hits');
    expect(response.body.cache).toHaveProperty('misses');
  });
});
