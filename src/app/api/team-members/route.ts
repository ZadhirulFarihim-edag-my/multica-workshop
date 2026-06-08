import { teamMemberCreateSchema } from "../../../lib/validations/team-member.schema";
import { teamMemberListQuerySchema } from "../../../lib/validations/query.schema";
import { parseJsonBody, parseQueryParams, errorResponse, successResponse, validationErrorResponse } from "../../../server/utils/http";
import { createTeamMemberRecord, listTeamMemberSummaries } from "../../../server/services/team-member.service";

export async function GET(request: Request) {
  const parsed = parseQueryParams(teamMemberListQuerySchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  const data = await listTeamMemberSummaries(parsed.data);
  return successResponse(data, "Team members fetched successfully");
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(teamMemberCreateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await createTeamMemberRecord(parsed.data);
    return successResponse({ item }, "Team member created successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
