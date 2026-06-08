import { commentCreateSchema } from "../../../lib/validations/comment.schema";
import { commentListQuerySchema } from "../../../lib/validations/query.schema";
import { parseJsonBody, parseQueryParams, errorResponse, successResponse, validationErrorResponse } from "../../../server/utils/http";
import { createCommentRecord, listCommentSummaries } from "../../../server/services/comment.service";

export async function GET(request: Request) {
  const parsed = parseQueryParams(commentListQuerySchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  const data = await listCommentSummaries(parsed.data);
  return successResponse(data, "Comments fetched successfully");
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(commentCreateSchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  try {
    const item = await createCommentRecord(parsed.data);
    return successResponse({ item }, "Comment created successfully");
  } catch (error) {
    return errorResponse(error);
  }
}
