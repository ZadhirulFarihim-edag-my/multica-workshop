import { z } from "zod";
import { optionalTrimmedString, trimmedString, updateObjectSchema } from "./shared";

const projectColorSchema = z
  .string()
  .regex(/^#?[0-9a-fA-F]{6}$/, "Project color must be a hex value such as #1a2b3c");

const projectFields = {
  name: trimmedString("Project name is required"),
  description: optionalTrimmedString(),
  color: projectColorSchema.optional(),
};

export const projectCreateSchema = z.object({
  name: projectFields.name,
  description: projectFields.description,
  color: projectFields.color,
});

export const projectUpdateSchema = updateObjectSchema(
  {
    name: projectFields.name,
    description: projectFields.description,
    color: projectFields.color,
  },
  "At least one project field must be provided"
);

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
