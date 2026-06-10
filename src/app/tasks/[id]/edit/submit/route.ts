import { NextResponse } from "next/server";
import { parseRequest } from "../../../../../lib/validation/parse-request";
import { taskUpdateSchema } from "../../../../../lib/validations/task.schema";
import { updateTaskRecord } from "../../../../../server/services/task.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function toOptionalString(value: FormDataEntryValue | null) {
  const parsed = typeof value === "string" ? value.trim() : "";
  return parsed ? parsed : undefined;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const formData = await request.formData();

  const parsed = parseRequest(taskUpdateSchema, {
    title: toOptionalString(formData.get("title")),
    description: toOptionalString(formData.get("description")) ?? null,
    status: toOptionalString(formData.get("status")),
    priority: toOptionalString(formData.get("priority")),
    projectId: toOptionalString(formData.get("projectId")),
    assigneeId: toOptionalString(formData.get("assigneeId")) ?? null,
    dueDate: toOptionalString(formData.get("dueDate")) ?? null,
  });

  if (!parsed.success) {
    const url = new URL(`/tasks/${id}/edit`, request.url);
    url.searchParams.set("error", parsed.error.details[0]?.message ?? parsed.error.message);
    return NextResponse.redirect(url, 303);
  }

  try {
    const item = await updateTaskRecord(id, parsed.data);
    return NextResponse.redirect(new URL(`/tasks/${item.id}`, request.url), 303);
  } catch (error) {
    const url = new URL(`/tasks/${id}/edit`, request.url);
    url.searchParams.set("error", error instanceof Error ? error.message : "Unable to update task");
    return NextResponse.redirect(url, 303);
  }
}
