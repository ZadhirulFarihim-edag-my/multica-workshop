import {
  createSuccessResponse,
  createValidationErrorResponse,
} from "../../lib/utils/api-response.js";
import { parseRequest } from "../../lib/validation/parse-request.js";
import { toApiErrorResponse } from "../../lib/utils/api-error.js";

export type JsonSuccessBody<T> = ReturnType<typeof createSuccessResponse<T>>;

export function responseFromResult<T>(result: { status: number; body: T }) {
  return Response.json(result.body, { status: result.status });
}

export function successResponse<T>(data: T, message?: string) {
  return responseFromResult(createSuccessResponse(data, message));
}

export function errorResponse(error: unknown) {
  return responseFromResult(toApiErrorResponse(error));
}

export function validationErrorResponse(details: unknown) {
  return responseFromResult(createValidationErrorResponse(details));
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

export function readQueryParams(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function parseQueryParams<TSchema extends import("zod").ZodTypeAny>(
  schema: TSchema,
  request: Request
) {
  return parseRequest(schema, readQueryParams(request));
}

export async function parseJsonBody<TSchema extends import("zod").ZodTypeAny>(
  schema: TSchema,
  request: Request
) {
  const body = await readJsonBody(request);
  return parseRequest(schema, body);
}
