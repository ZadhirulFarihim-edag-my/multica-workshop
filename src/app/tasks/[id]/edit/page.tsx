import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../../components/ui/page-header";
import { TaskForm } from "../../../../features/tasks/task-form";
import { listProjectSummaries } from "../../../../server/services/project.service";
import { getTaskDetail } from "../../../../server/services/task.service";
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

export default async function EditTaskPage({ params, searchParams }: PageProps) {
  const { id } = await Promise.resolve(params);
  const query = await Promise.resolve(searchParams ?? {});

  try {
    const [task, projects, members] = await Promise.all([
      getTaskDetail(id),
      listProjectSummaries({ page: 1, pageSize: 100 }),
      listTeamMemberSummaries({ page: 1, pageSize: 100 }),
    ]);

    return (
      <div className="page">
        <PageHeader
          eyebrow="Tasks"
          title={`Edit ${task.title}`}
          description="Update the task metadata that drives planning, assignment, and delivery tracking."
          actions={
            <Link className="button button-secondary button-link" href={`/tasks/${task.id}`}>
              Back to task
            </Link>
          }
        />

        <TaskForm
          errorMessage={getErrorMessage(query.error)}
          members={members.items.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
          }))}
          mode="edit"
          projects={projects.items.map((project) => ({
            id: project.id,
            name: project.name,
          }))}
          submitPath={`/tasks/${task.id}/edit/submit`}
          task={{
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            projectId: task.projectId,
            assigneeId: task.assigneeId ?? null,
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
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
