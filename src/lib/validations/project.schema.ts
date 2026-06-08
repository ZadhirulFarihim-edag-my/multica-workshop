import { z } from "zod";
import {
  entityIdSchema,
  optionalTrimmedString,
  trimmedString,
  updateObjectSchema,
} from "./shared.js";

const projectColorSchema = z
  .string()
  .regex(/^#?[0-9a-fA-F]{6}$/, "Project color must be a hex value such as #1a2b3c");

export const projectStatusSchema = z.enum(["planning", "active", "archived"]);

const projectFields = {
  name: trimmedString("Project name is required"),
  description: optionalTrimmedString(),
  ownerId: entityIdSchema,
  status: projectStatusSchema,
  color: projectColorSchema.optional(),
};

export const projectCreateSchema = z.object({
  name: projectFields.name,
  description: projectFields.description,
  ownerId: projectFields.ownerId,
  status: projectFields.status.default("active"),
  color: projectFields.color,
});

export const projectUpdateSchema = updateObjectSchema(
  {
    name: projectFields.name,
    description: projectFields.description,
    ownerId: projectFields.ownerId,
    status: projectFields.status,
    color: projectFields.color,
  },
  "At least one project field must be provided"
);

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
