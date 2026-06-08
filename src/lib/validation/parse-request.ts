import { z } from "zod";

export type ValidationFailure = {
  code: "VALIDATION_ERROR";
  message: "Request validation failed";
  details: z.ZodIssue[];
};

export type ParseRequestResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ValidationFailure;
    };

export function parseRequest<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown
): ParseRequestResult<z.infer<TSchema>> {
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: result.error.issues,
    },
  };
}
