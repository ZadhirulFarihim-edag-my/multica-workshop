import { prisma } from "../../lib/db/prisma";
import { activityLogSummarySelect } from "./selects";

type ActivityLogFindManyArgs = NonNullable<Parameters<typeof prisma.activityLog.findMany>[0]>;
type ActivityLogCountArgs = NonNullable<Parameters<typeof prisma.activityLog.count>[0]>;

export async function listActivityLogs(where?: ActivityLogFindManyArgs["where"]) {
  return prisma.activityLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: activityLogSummarySelect,
  });
}

export async function countActivityLogs(where?: ActivityLogCountArgs["where"]) {
  return prisma.activityLog.count({ where });
}

export async function createActivityLog(data: Parameters<typeof prisma.activityLog.create>[0]["data"]) {
  return prisma.activityLog.create({
    data,
    select: activityLogSummarySelect,
  });
}
