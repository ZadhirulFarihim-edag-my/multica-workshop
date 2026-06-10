import Link from "next/link";

const taskStatuses = ["todo", "in_progress", "review", "blocked", "done"] as const;
const priorities = ["low", "medium", "high", "urgent"] as const;

type TaskStatus = (typeof taskStatuses)[number];
type TaskPriority = (typeof priorities)[number];

type TaskFormProps = {
  mode: "create" | "edit";
  submitPath: string;
  errorMessage?: string;
  task?: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: string;
    assigneeId: string | null;
    dueDate: string | Date | null;
  };
  projects: Array<{
    id: string;
    name: string;
  }>;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  defaultProjectId?: string;
};

function toDateInputValue(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function TaskForm({ mode, submitPath, errorMessage, task, projects, members, defaultProjectId }: TaskFormProps) {
  return (
    <form action={submitPath} className="section-card form-stack" method="post">
      <div className="section-card-header">
        <div>
          <p className="section-title">{mode === "create" ? "Task details" : "Edit task"}</p>
          <p className="section-description">
            {mode === "create"
              ? "Capture a new task, its owner, and its delivery timing."
              : "Update the task fields shown in lists, detail views, and reports."}
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Title</span>
          <input className="input" defaultValue={task?.title ?? ""} name="title" required />
        </label>

        <label className="field">
          <span className="field-label">Project</span>
          <select
            className="select"
            defaultValue={task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? ""}
            name="projectId"
            required
          >
            {projects.map((projectOption) => (
              <option key={projectOption.id} value={projectOption.id}>
                {projectOption.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Status</span>
          <select className="select" defaultValue={task?.status ?? "todo"} name="status" required>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Priority</span>
          <select className="select" defaultValue={task?.priority ?? "medium"} name="priority" required>
            {priorities.map((priorityOption) => (
              <option key={priorityOption} value={priorityOption}>
                {priorityOption.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Assignee</span>
          <select className="select" defaultValue={task?.assigneeId ?? ""} name="assigneeId">
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Due date</span>
          <input className="input" defaultValue={toDateInputValue(task?.dueDate)} name="dueDate" type="date" />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Description</span>
        <textarea className="textarea" defaultValue={task?.description ?? ""} name="description" rows={5} />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="form-actions">
        <button className="button button-primary" type="submit">
          {mode === "create" ? "Create task" : "Save changes"}
        </button>
        <Link className="button button-secondary button-link" href={task ? `/tasks/${task.id}` : "/tasks"}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
