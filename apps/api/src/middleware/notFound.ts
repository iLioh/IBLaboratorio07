import type { RequestHandler } from 'express';

export const notFound: RequestHandler = (request, response) => {
  response
    .status(404)
    .json({ error: 'Route not found', path: request.originalUrl || request.path });
};
