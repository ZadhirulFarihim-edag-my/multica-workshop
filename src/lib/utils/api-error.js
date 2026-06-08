import {
  createErrorResponse,
  createInternalServerErrorResponse,
} from './api-response.js';

export class ApiError extends Error {
  constructor({
    status,
    code,
    message,
    details,
    expose = status < 500,
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.expose = expose;

    if (details !== undefined) {
      this.details = details;
    }
  }
}

export function isApiError(error) {
  return error instanceof ApiError;
}

export function toApiErrorResponse(error) {
  if (!isApiError(error)) {
    return createInternalServerErrorResponse();
  }

  if (!error.expose && error.status >= 500) {
    return createInternalServerErrorResponse();
  }

  return createErrorResponse({
    status: error.status,
    code: error.code,
    message: error.message,
    details: error.details,
  });
}
