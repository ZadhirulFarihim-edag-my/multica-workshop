import { projectCreateSchema } from "../../../lib/validations/project.schema";
import { projectListQuerySchema } from "../../../lib/validations/query.schema";
import { parseJsonBody, parseQueryParams, errorResponse, successResponse, validationErrorResponse } from "../../../server/utils/http";
import { createProjectRecord, listProjectSummaries } from "../../../server/services/project.service";

export async function GET(request: Request) {
  const parsed = parseQueryParams(projectListQuerySchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  const data = await listProjectSummaries(parsed.data);
  return successResponse(data, "Projects fetched successfully");
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(projectCreateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await createProjectRecord(parsed.data);
    return successResponse({ item }, "Project created successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
