import { NextResponse } from "next/server";
import { parseRequest } from "../../../../lib/validation/parse-request";
import { projectCreateSchema } from "../../../../lib/validations/project.schema";
import { createProjectRecord } from "../../../../server/services/project.service";

function toOptionalString(value: FormDataEntryValue | null) {
  const parsed = typeof value === "string" ? value.trim() : "";
  return parsed ? parsed : undefined;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const parsed = parseRequest(projectCreateSchema, {
    name: toOptionalString(formData.get("name")),
    description: toOptionalString(formData.get("description")),
    ownerId: toOptionalString(formData.get("ownerId")),
    status: toOptionalString(formData.get("status")),
    color: toOptionalString(formData.get("color")),
  });

  if (!parsed.success) {
    const url = new URL("/projects/new", request.url);
    url.searchParams.set("error", parsed.error.details[0]?.message ?? parsed.error.message);
    return NextResponse.redirect(url, 303);
  }

  try {
    const item = await createProjectRecord(parsed.data);
    return NextResponse.redirect(new URL(`/projects/${item.id}`, request.url), 303);
  } catch (error) {
    const url = new URL("/projects/new", request.url);
    url.searchParams.set("error", error instanceof Error ? error.message : "Unable to create project");
    return NextResponse.redirect(url, 303);
  }
}
