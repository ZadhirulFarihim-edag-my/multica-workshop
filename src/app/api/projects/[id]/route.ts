import { projectUpdateSchema } from "../../../../lib/validations/project.schema";
import { parseJsonBody, errorResponse, successResponse, validationErrorResponse } from "../../../../server/utils/http";
import {
  deleteProjectRecord,
  getProjectDetail,
  updateProjectRecord,
} from "../../../../server/services/project.service";
import { parseRequest } from "../../../../lib/validation/parse-request";
import { entityIdSchema } from "../../../../lib/validations/shared";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function validateId(id: string) {
  return parseRequest(entityIdSchema, id);
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsedId = validateId(id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  try {
    const item = await getProjectDetail(parsedId.data);
    return successResponse({ item }, "Project fetched successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsedId = validateId(id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  const parsed = await parseJsonBody(projectUpdateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await updateProjectRecord(parsedId.data, parsed.data);
    return successResponse({ item }, "Project updated successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsedId = validateId(id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  try {
    const item = await deleteProjectRecord(parsedId.data);
    return successResponse({ item }, "Project deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
