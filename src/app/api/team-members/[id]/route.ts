import {
  createSuccessResponse,
  createValidationErrorResponse,
} from "../../../../lib/utils/api-response.js";
import { parseRequest } from "../../../../lib/validation/parse-request";
import {
  teamMemberIdSchema,
  teamMemberUpdateSchema,
} from "../../../../lib/validations/team-member.schema";
import { toApiErrorResponse } from "../../../../lib/utils/api-error.js";
import { createTeamMemberService } from "../../../../server/services/team-member.service";

const teamMemberService = createTeamMemberService();

function toJsonResponse(response: {
  status: number;
  body: unknown;
}) {
  return Response.json(response.body, {
    status: response.status,
  });
}

function parseTeamMemberId(id: string) {
  const parsed = parseRequest(teamMemberIdSchema, id);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export async function GET(_: Request, context: { params: { id: string } }) {
  const id = parseTeamMemberId(context.params.id);

  if (!id) {
    return toJsonResponse(
      createValidationErrorResponse([
        {
          path: ["id"],
          message: "Team member id is required",
        },
      ]),
    );
  }

  try {
    const teamMember = await teamMemberService.getTeamMember(id);

    return toJsonResponse(
      createSuccessResponse({
        teamMember,
      }),
    );
  } catch (error) {
    return toJsonResponse(toApiErrorResponse(error));
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const id = parseTeamMemberId(context.params.id);

  if (!id) {
    return toJsonResponse(
      createValidationErrorResponse([
        {
          path: ["id"],
          message: "Team member id is required",
        },
      ]),
    );
  }

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

  const parsedBody = parseRequest(teamMemberUpdateSchema, body);

  if (!parsedBody.success) {
    return toJsonResponse(createValidationErrorResponse(parsedBody.error.details));
  }

  try {
    const teamMember = await teamMemberService.updateTeamMember(
      id,
      parsedBody.data,
    );

    return toJsonResponse(
      createSuccessResponse(
        {
          teamMember,
        },
        "Team member updated successfully",
      ),
    );
  } catch (error) {
    return toJsonResponse(toApiErrorResponse(error));
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const id = parseTeamMemberId(context.params.id);

  if (!id) {
    return toJsonResponse(
      createValidationErrorResponse([
        {
          path: ["id"],
          message: "Team member id is required",
        },
      ]),
    );
  }

  try {
    const teamMember = await teamMemberService.deactivateTeamMember(id);

    return toJsonResponse(
      createSuccessResponse(
        {
          teamMember,
        },
        "Team member deactivated successfully",
      ),
    );
  } catch (error) {
    return toJsonResponse(toApiErrorResponse(error));
  }
}
