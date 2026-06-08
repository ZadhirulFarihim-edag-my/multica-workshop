import { activityLogListQuerySchema } from "../../../lib/validations/query.schema";
import { parseQueryParams, successResponse, validationErrorResponse } from "../../../server/utils/http";
import { listActivityLogSummaries } from "../../../server/services/activity-log.service";

export async function GET(request: Request) {
  const parsed = parseQueryParams(activityLogListQuerySchema, request);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.details);
  }

  const data = await listActivityLogSummaries(parsed.data);
  return successResponse(data, "Activity logs fetched successfully");
}
