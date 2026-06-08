import { taskCreateSchema } from "../../../lib/validations/task.schema";
import { taskListQuerySchema } from "../../../lib/validations/query.schema";
import { parseJsonBody, parseQueryParams, errorResponse, successResponse, validationErrorResponse } from "../../../server/utils/http";
import { createTaskRecord, listTaskSummaries } from "../../../server/services/task.service";

export async function GET(request: Request) {
  const parsed = parseQueryParams(taskListQuerySchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  const data = await listTaskSummaries(parsed.data);
  return successResponse(data, "Tasks fetched successfully");
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(taskCreateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await createTaskRecord(parsed.data);
    return successResponse({ item }, "Task created successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
