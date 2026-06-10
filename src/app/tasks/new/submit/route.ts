import { NextResponse } from "next/server";
import { parseRequest } from "../../../../lib/validation/parse-request";
import { taskCreateSchema } from "../../../../lib/validations/task.schema";
import { createTaskRecord } from "../../../../server/services/task.service";

function toOptionalString(value: FormDataEntryValue | null) {
  const parsed = typeof value === "string" ? value.trim() : "";
  return parsed ? parsed : undefined;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const parsed = parseRequest(taskCreateSchema, {
    title: toOptionalString(formData.get("title")),
    description: toOptionalString(formData.get("description")),
    status: toOptionalString(formData.get("status")),
    priority: toOptionalString(formData.get("priority")),
    projectId: toOptionalString(formData.get("projectId")),
    assigneeId: toOptionalString(formData.get("assigneeId")),
    dueDate: toOptionalString(formData.get("dueDate")),
  });

  if (!parsed.success) {
    const url = new URL("/tasks/new", request.url);
    url.searchParams.set("error", parsed.error.details[0]?.message ?? parsed.error.message);
    return NextResponse.redirect(url, 303);
  }

  try {
    const item = await createTaskRecord(parsed.data);
    return NextResponse.redirect(new URL(`/tasks/${item.id}`, request.url), 303);
  } catch (error) {
    const url = new URL("/tasks/new", request.url);
    url.searchParams.set("error", error instanceof Error ? error.message : "Unable to create task");
    return NextResponse.redirect(url, 303);
  }
}
