/* global __ENV */

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL ?? '').replace(/\/$/, '');

if (!baseUrl) {
  throw new Error('BASE_URL is required, for example: https://<qa-fqdn>');
}

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 20 },
    { duration: '20s', target: 30 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.99'],
  },
};

const endpoints = ['/health', '/api/transactions', '/api/metrics'];

export default function () {
  for (const endpoint of endpoints) {
    const response = http.get(`${baseUrl}${endpoint}`, {
      tags: { endpoint },
    });

    check(response, {
      [`${endpoint} returns 200`]: (result) => result.status === 200,
    });
  }

  sleep(0.5);
}
