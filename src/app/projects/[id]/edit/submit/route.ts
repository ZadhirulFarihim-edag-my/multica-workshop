import { NextResponse } from "next/server";
import { parseRequest } from "../../../../../lib/validation/parse-request";
import { projectUpdateSchema } from "../../../../../lib/validations/project.schema";
import { updateProjectRecord } from "../../../../../server/services/project.service";

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

  const parsed = parseRequest(projectUpdateSchema, {
    name: toOptionalString(formData.get("name")),
    description: toOptionalString(formData.get("description")) ?? null,
    ownerId: toOptionalString(formData.get("ownerId")),
    status: toOptionalString(formData.get("status")),
    color: toOptionalString(formData.get("color")) ?? null,
  });

  if (!parsed.success) {
    const url = new URL(`/projects/${id}/edit`, request.url);
    url.searchParams.set("error", parsed.error.details[0]?.message ?? parsed.error.message);
    return NextResponse.redirect(url, 303);
  }

  try {
    const item = await updateProjectRecord(id, parsed.data);
    return NextResponse.redirect(new URL(`/projects/${item.id}`, request.url), 303);
  } catch (error) {
    const url = new URL(`/projects/${id}/edit`, request.url);
    url.searchParams.set("error", error instanceof Error ? error.message : "Unable to update project");
    return NextResponse.redirect(url, 303);
  }
}
