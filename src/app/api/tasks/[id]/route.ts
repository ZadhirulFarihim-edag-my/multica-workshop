import { taskUpdateSchema } from "../../../../lib/validations/task.schema";
import { entityIdSchema } from "../../../../lib/validations/shared";
import { parseJsonBody, errorResponse, successResponse, validationErrorResponse } from "../../../../server/utils/http";
import { deleteTaskRecord, getTaskDetail, updateTaskRecord } from "../../../../server/services/task.service";
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
    const item = await getTaskDetail(parsedId.data);
    return successResponse({ item }, "Task fetched successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const parsedId = validateId(context.params.id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  const parsed = await parseJsonBody(taskUpdateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await updateTaskRecord(parsedId.data, parsed.data);
    return successResponse({ item }, "Task updated successfully");
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
    const item = await deleteTaskRecord(parsedId.data);
    return successResponse({ item }, "Task deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
