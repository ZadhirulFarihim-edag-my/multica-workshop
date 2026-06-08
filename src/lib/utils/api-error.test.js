import assert from 'node:assert/strict';
import { ApiError, isApiError, toApiErrorResponse } from './api-error.js';

export const tests = [
  {
    name: 'recognizes api errors',
    run: () => {
      assert.equal(
        isApiError(
          new ApiError({
            status: 404,
            code: 'NOT_FOUND',
            message: 'Task not found',
          }),
        ),
        true,
      );
    },
  },
  {
    name: 'maps an api error to a response body and status',
    run: () => {
      const error = new ApiError({
        status: 404,
        code: 'NOT_FOUND',
        message: 'Task not found',
      });

      assert.deepEqual(toApiErrorResponse(error), {
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
    name: 'hides unknown errors behind a generic internal server error response',
    run: () => {
      assert.deepEqual(toApiErrorResponse(new Error('database exploded')), {
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
