import { ApiError } from "../../lib/utils/api-error.js";

export function createNotFoundError(message: string) {
  return new ApiError({
    status: 404,
    code: "NOT_FOUND",
    message,
  });
}

export function createConflictError(message: string) {
  return new ApiError({
    status: 409,
    code: "CONFLICT",
    message,
  });
}

export function createBadRequestError(message: string) {
  return new ApiError({
    status: 400,
    code: "BAD_REQUEST",
    message,
  });
}
