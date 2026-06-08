export type ApiSuccessResponse<T> = {
  status: number;
  body: {
    success: true;
    data: T;
    message: string;
  };
};

export type ApiErrorResponse = {
  status: number;
  body: {
    success: false;
    error: {
      code: string;
      message: string;
      details?: unknown;
    };
  };
};

export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T>;

export function createErrorResponse(input: {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}): ApiErrorResponse;

export function createValidationErrorResponse(
  details: unknown,
  message?: string
): ApiErrorResponse;

export function createNotFoundResponse(
  message?: string,
  details?: unknown
): ApiErrorResponse;

export function createInternalServerErrorResponse(
  message?: string
): ApiErrorResponse;
