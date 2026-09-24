import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';

describe('TechBank API', () => {
  it('GET /health returns 200 and status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /ready returns 200 and ready status', async () => {
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready' });
  });

  it('GET /api/version returns required metadata', async () => {
    const response = await request(app).get('/api/version');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      appVersion: expect.any(String),
      gitSha: expect.any(String),
      buildTime: expect.any(String),
      pipelineVersion: expect.any(String),
      environment: expect.any(String),
    });
  });

  it('GET /api/transactions returns a synthetic transaction array', async () => {
    const response = await request(app).get('/api/transactions');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('transactionId');
  });

  it('GET /api/metrics returns dashboard metrics', async () => {
    const response = await request(app).get('/api/metrics');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      processedToday: expect.any(Number),
      operations: expect.any(Number),
      approvalRate: expect.any(Number),
      riskAlerts: expect.any(Number),
    });
  });
});
