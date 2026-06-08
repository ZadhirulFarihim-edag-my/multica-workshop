import { z } from "zod";
import { optionalTrimmedString, trimmedString, updateObjectSchema } from "./shared";

export const teamMemberIdSchema = trimmedString("Team member id is required");

export const teamMemberRoleSchema = trimmedString("Team member role is required");

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

export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
