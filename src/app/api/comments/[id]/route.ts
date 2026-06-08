import { commentUpdateSchema } from "../../../../lib/validations/comment.schema";
import { entityIdSchema } from "../../../../lib/validations/shared";
import { parseJsonBody, errorResponse, successResponse, validationErrorResponse } from "../../../../server/utils/http";
import { deleteCommentRecord, getCommentDetail, updateCommentRecord } from "../../../../server/services/comment.service";
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
    const item = await getCommentDetail(parsedId.data);
    return successResponse({ item }, "Comment fetched successfully");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const parsedId = validateId(context.params.id);

  if (!parsedId.success) {
    return validationErrorResponse(parsedId.error.details);
  }

  const parsed = await parseJsonBody(commentUpdateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await updateCommentRecord(parsedId.data, parsed.data);
    return successResponse({ item }, "Comment updated successfully");
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
    const item = await deleteCommentRecord(parsedId.data);
    return successResponse({ item }, "Comment deleted successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
