import { z } from "zod";

export const trimmedString = (message = "This field is required") =>
  z.string().trim().min(1, { message });

export const optionalTrimmedString = () => z.string().trim().min(1).optional();

export const uuidSchema = z.string().uuid();

export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const updateObjectSchema = <TShape extends z.ZodRawShape>(
  shape: TShape,
  message = "At least one field must be provided"
) =>
  z
    .object(shape)
    .partial()
    .refine((value) => Object.values(value).some((field) => field !== undefined), {
      message,
    });
