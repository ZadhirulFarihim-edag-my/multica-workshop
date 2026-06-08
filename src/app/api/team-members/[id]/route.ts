import { teamMemberUpdateSchema } from "../../../../lib/validations/team-member.schema";
import { entityIdSchema } from "../../../../lib/validations/shared";
import { parseJsonBody, errorResponse, successResponse, validationErrorResponse } from "../../../../server/utils/http";
import {
  deleteTeamMemberRecord,
  getTeamMemberDetail,
  updateTeamMemberRecord,
} from "../../../../server/services/team-member.service";
import { parseRequest } from "../../../../lib/validation/parse-request";

type RouteContext = {
  params: {
    id: string;
  };
};

function validateId(id: string) {
  return parseRequest(entityIdSchema, id);
}

export async function GET(_request: Request, context: RouteContext) {
  const parsedId = validateId(context.params.id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  try {
    const item = await getTeamMemberDetail(parsedId.data);
    return successResponse({ item }, "Team member fetched successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const parsedId = validateId(context.params.id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  const parsed = await parseJsonBody(teamMemberUpdateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await updateTeamMemberRecord(parsedId.data, parsed.data);
    return successResponse({ item }, "Team member updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const parsedId = validateId(context.params.id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  try {
    const item = await deleteTeamMemberRecord(parsedId.data);
    return successResponse({ item }, "Team member deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
