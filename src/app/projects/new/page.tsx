import Link from "next/link";
import { PageHeader } from "../../../components/ui/page-header";
import { ProjectForm } from "../../../features/projects/project-form";
import { listTeamMemberSummaries } from "../../../server/services/team-member.service";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

function getErrorMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewProjectPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const members = await listTeamMemberSummaries({ page: 1, pageSize: 100, status: "active" });

  return (
    <div className="page">
      <PageHeader
        eyebrow="Projects"
        title="Create project"
        description="Add a new project to the workspace and make it available across the GUI."
        actions={
          <Link className="button button-secondary button-link" href="/projects">
            Back to projects
          </Link>
        }
      />

      <ProjectForm
        errorMessage={getErrorMessage(params.error)}
        members={members.items.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
        }))}
        mode="create"
        submitPath="/projects/new/submit"
      />
    </div>
  );
}
