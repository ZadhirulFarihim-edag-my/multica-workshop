const DEFAULT_SUCCESS_MESSAGE = 'Request completed successfully';
const DEFAULT_VALIDATION_MESSAGE = 'Validation failed';
const DEFAULT_NOT_FOUND_MESSAGE = 'Resource not found';
const DEFAULT_INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';

export function createSuccessResponse(data, message = DEFAULT_SUCCESS_MESSAGE) {
  return {
    status: 200,
    body: {
      success: true,
      data,
      message,
    },
  };
}

export function createErrorResponse({
  status,
  code,
  message,
  details,
}) {
  const error = {
    code,
    message,
  };

  if (details !== undefined) {
    error.details = details;
  }

  return {
    status,
    body: {
      success: false,
      error,
    },
  };
}

export function createValidationErrorResponse(
  details,
  message = DEFAULT_VALIDATION_MESSAGE,
) {
  return createErrorResponse({
    status: 400,
    code: 'VALIDATION_ERROR',
    message,
    details,
  });
}

export function createNotFoundResponse(
  message = DEFAULT_NOT_FOUND_MESSAGE,
  details,
) {
  return createErrorResponse({
    status: 404,
    code: 'NOT_FOUND',
    message,
    details,
  });
}

export function createInternalServerErrorResponse(
  message = DEFAULT_INTERNAL_SERVER_ERROR_MESSAGE,
) {
  return createErrorResponse({
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message,
  });
}
