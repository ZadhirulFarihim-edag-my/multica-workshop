import { createPageInfo } from "../utils/pagination";
import { countActivityLogs, listActivityLogs } from "../repositories/activity-log.repository";

export async function listActivityLogSummaries(query: {
  page: number;
  pageSize: number;
  projectId?: string;
  taskId?: string;
  actorId?: string;
  action?: string;
}) {
  const where = {
    AND: [
      ...(query.projectId ? [{ projectId: query.projectId }] : []),
      ...(query.taskId ? [{ taskId: query.taskId }] : []),
      ...(query.actorId ? [{ actorId: query.actorId }] : []),
      ...(query.action ? [{ action: query.action }] : []),
    ],
  } as Parameters<typeof listActivityLogs>[0];

  const offset = (query.page - 1) * query.pageSize;
  const [items, totalItems] = await Promise.all([
    listActivityLogs(where),
    countActivityLogs(where),
  ]);

  return {
    items: items.slice(offset, offset + query.pageSize),
    pageInfo: createPageInfo(totalItems, query.page, query.pageSize),
  };
}
