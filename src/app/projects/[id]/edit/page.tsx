import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../../components/ui/page-header";
import { ProjectForm } from "../../../../features/projects/project-form";
import { getProjectDetail } from "../../../../server/services/project.service";
import { listTeamMemberSummaries } from "../../../../server/services/team-member.service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 404;
}

function getErrorMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditProjectPage({ params, searchParams }: PageProps) {
  const { id } = await Promise.resolve(params);
  const query = await Promise.resolve(searchParams ?? {});

  try {
    const [project, members] = await Promise.all([
      getProjectDetail(id),
      listTeamMemberSummaries({ page: 1, pageSize: 100 }),
    ]);

    return (
      <div className="page">
        <PageHeader
          eyebrow="Projects"
          title={`Edit ${project.name}`}
          description="Update the project data surfaced in portfolio, detail, and task views."
          actions={
            <Link className="button button-secondary button-link" href={`/projects/${project.id}`}>
              Back to project
            </Link>
          }
        />

        <ProjectForm
          errorMessage={getErrorMessage(query.error)}
          members={members.items.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
          }))}
          mode="edit"
          submitPath={`/projects/${project.id}/edit/submit`}
          project={{
            id: project.id,
            name: project.name,
            description: project.description,
            ownerId: project.ownerId,
            status: project.status,
            color: project.color,
          }}
        />
      </div>
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }
}
