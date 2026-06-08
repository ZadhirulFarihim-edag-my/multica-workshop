import {
  createSuccessResponse,
  createValidationErrorResponse,
} from "../../../lib/utils/api-response.js";
import { toApiErrorResponse } from "../../../lib/utils/api-error.js";
import { parseRequest } from "../../../lib/validation/parse-request";
import { teamMemberCreateSchema } from "../../../lib/validations/team-member.schema";
import { createTeamMemberService } from "../../../server/services/team-member.service";

const teamMemberService = createTeamMemberService();

function toJsonResponse(response: {
  status: number;
  body: unknown;
}) {
  return Response.json(response.body, {
    status: response.status,
  });
}

export async function GET() {
  try {
    const result = await teamMemberService.listTeamMembers();

    return toJsonResponse(
      createSuccessResponse({
        teamMembers: result.items,
        total: result.total,
      }),
    );
  } catch (error) {
    return toJsonResponse(toApiErrorResponse(error));
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return toJsonResponse(
      createValidationErrorResponse([
        {
          path: ["body"],
          message: "Request body must be valid JSON",
        },
      ]),
    );
  }

  const parsedBody = parseRequest(teamMemberCreateSchema, body);

  if (!parsedBody.success) {
    return toJsonResponse(createValidationErrorResponse(parsedBody.error.details));
  }

  try {
    const teamMember = await teamMemberService.createTeamMember(parsedBody.data);

    return toJsonResponse(
      createSuccessResponse(
        {
          teamMember,
        },
        "Team member created successfully",
      ),
    );
  } catch (error) {
    return toJsonResponse(toApiErrorResponse(error));
  }
}
