import assert from 'node:assert/strict';
import {
  createErrorResponse,
  createInternalServerErrorResponse,
  createNotFoundResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from './api-response.js';

export const tests = [
  {
    name: 'creates a default success response',
    run: () => {
      assert.deepEqual(createSuccessResponse({ id: 'task-1' }), {
        status: 200,
        body: {
          success: true,
          data: { id: 'task-1' },
          message: 'Request completed successfully',
        },
      });
    },
  },
  {
    name: 'creates a validation error response with details',
    run: () => {
      assert.deepEqual(
        createValidationErrorResponse([
          { path: 'title', message: 'Title is required' },
        ]),
        {
          status: 400,
          body: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: [{ path: 'title', message: 'Title is required' }],
            },
          },
        },
      );
    },
  },
  {
    name: 'creates a not found response',
    run: () => {
      assert.deepEqual(createNotFoundResponse('Task not found'), {
        status: 404,
        body: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found',
          },
        },
      });
    },
  },
  {
    name: 'creates a generic error response',
    run: () => {
      assert.deepEqual(
        createErrorResponse({
          status: 409,
          code: 'CONFLICT',
          message: 'Task already exists',
        }),
        {
          status: 409,
          body: {
            success: false,
            error: {
              code: 'CONFLICT',
              message: 'Task already exists',
            },
          },
        },
      );
    },
  },
  {
    name: 'creates a generic internal server error response',
    run: () => {
      assert.deepEqual(createInternalServerErrorResponse(), {
        status: 500,
        body: {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
          },
        },
      });
    },
  },
];
