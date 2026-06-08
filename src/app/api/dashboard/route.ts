import { successResponse } from "../../../server/utils/http";
import { getDashboardSnapshot } from "../../../server/services/dashboard.service";

export async function GET() {
  const data = await getDashboardSnapshot();
  return successResponse(data, "Dashboard fetched successfully");
}
