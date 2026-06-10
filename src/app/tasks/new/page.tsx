import Link from "next/link";
import { PageHeader } from "../../../components/ui/page-header";
import { TaskForm } from "../../../features/tasks/task-form";
import { parseString } from "../../../lib/query-params";
import { listProjectSummaries } from "../../../server/services/project.service";
import { listTeamMemberSummaries } from "../../../server/services/team-member.service";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

function getErrorMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewTaskPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const defaultProjectId = parseString(params.projectId);

  const [projects, members] = await Promise.all([
    listProjectSummaries({ page: 1, pageSize: 100 }),
    listTeamMemberSummaries({ page: 1, pageSize: 100, status: "active" }),
  ]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Tasks"
        title="Create task"
        description="Add a task to a project and make it immediately visible in the board and detail views."
        actions={
          <Link className="button button-secondary button-link" href="/tasks">
            Back to tasks
          </Link>
        }
      />

      <TaskForm
        defaultProjectId={defaultProjectId}
        errorMessage={getErrorMessage(params.error)}
        members={members.items.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
        }))}
        mode="create"
        projects={projects.items.map((project) => ({
          id: project.id,
          name: project.name,
        }))}
        submitPath="/tasks/new/submit"
      />
    </div>
  );
}
