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
      appVersion: 'v1.0.0',
      gitSha: expect.any(String),
      buildTime: expect.any(String),
      pipelineVersion: 'v1.0.0',
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

  it('GET /api/releases returns release metadata with explicit containerImage status', async () => {
    const response = await request(app).get('/api/releases');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      appVersion: 'v1.0.0',
      gitSha: expect.any(String),
      buildTime: expect.any(String),
      pipelineVersion: 'v1.0.0',
      environment: expect.any(String),
      containerImage: expect.any(String),
      releaseStatus: expect.any(String),
    });
    // Defaults to not-built when CONTAINER_IMAGE env var is not set in local dev
    expect(response.body.containerImage).toBe(process.env.CONTAINER_IMAGE ?? 'not-built');
  });

  it('GET /api/not-found returns 404 JSON and does not return HTML', async () => {
    const response = await request(app).get('/api/not-found');
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toEqual({
      error: 'Route not found',
      path: '/api/not-found',
    });
  });

  it('GET / serves SPA index.html', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('TechBank Operations Center');
  });

  it('GET /risk serves SPA index.html via fallback routing', async () => {
    const response = await request(app).get('/risk');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('TechBank Operations Center');
  });

  it('GET /services serves SPA index.html via fallback routing', async () => {
    const response = await request(app).get('/services');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('TechBank Operations Center');
  });

  it('POST /unknown returns 404 JSON and does not serve SPA HTML', async () => {
    const response = await request(app).post('/unknown');
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/json/);
  });
});
