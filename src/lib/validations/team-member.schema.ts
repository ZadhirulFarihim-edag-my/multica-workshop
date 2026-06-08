import { z } from "zod";
import {
  entityIdSchema,
  optionalTrimmedString,
  trimmedString,
  updateObjectSchema,
} from "./shared.js";

export const teamMemberRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);

export const teamMemberStatusSchema = z.enum(["active", "inactive", "invited"]);

const teamMemberFields = {
  name: trimmedString("Team member name is required"),
  email: z.string().trim().email("Team member email must be valid"),
  role: teamMemberRoleSchema,
  status: teamMemberStatusSchema,
  avatarUrl: z.string().url("Team member avatar URL must be valid").optional(),
  notes: optionalTrimmedString(),
};

export const teamMemberCreateSchema = z.object({
  id: entityIdSchema.optional(),
  name: teamMemberFields.name,
  email: teamMemberFields.email,
  role: teamMemberFields.role,
  status: teamMemberFields.status.default("active"),
  avatarUrl: teamMemberFields.avatarUrl,
  notes: teamMemberFields.notes,
});

export const teamMemberUpdateSchema = updateObjectSchema(
  {
    name: teamMemberFields.name,
    email: teamMemberFields.email,
    role: teamMemberFields.role,
    status: teamMemberFields.status,
    avatarUrl: teamMemberFields.avatarUrl,
    notes: teamMemberFields.notes,
  },
  "At least one team member field must be provided"
);

export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
