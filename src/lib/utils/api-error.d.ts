import type { ApiErrorResponse } from "./api-response.js";

export type ApiErrorInput = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  expose?: boolean;
};

export declare class ApiError extends Error {
  status: number;
  code: string;
  expose: boolean;
  details?: unknown;

  constructor(input: ApiErrorInput);
}

export function isApiError(error: unknown): error is ApiError;

export function toApiErrorResponse(error: unknown): ApiErrorResponse;
