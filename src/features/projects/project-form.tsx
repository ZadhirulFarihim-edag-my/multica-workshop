import Link from "next/link";

const projectStatuses = ["planning", "active", "archived"] as const;

type ProjectStatus = (typeof projectStatuses)[number];

type ProjectFormProps = {
  mode: "create" | "edit";
  submitPath: string;
  errorMessage?: string;
  project?: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    status: ProjectStatus;
    color: string | null;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
};

export function ProjectForm({ mode, submitPath, errorMessage, project, members }: ProjectFormProps) {
  return (
    <form action={submitPath} className="section-card form-stack" method="post">
      <div className="section-card-header">
        <div>
          <p className="section-title">{mode === "create" ? "Project details" : "Edit project"}</p>
          <p className="section-description">
            {mode === "create"
              ? "Create a new project record and assign an owner."
              : "Update the project metadata shown throughout the workspace."}
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Project name</span>
          <input className="input" defaultValue={project?.name ?? ""} name="name" required />
        </label>

        <label className="field">
          <span className="field-label">Owner</span>
          <select className="select" defaultValue={project?.ownerId ?? members[0]?.id ?? ""} name="ownerId" required>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Status</span>
          <select className="select" defaultValue={project?.status ?? "active"} name="status" required>
            {projectStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Color</span>
          <input className="input" defaultValue={project?.color ?? ""} name="color" placeholder="#0f766e" />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Description</span>
        <textarea className="textarea" defaultValue={project?.description ?? ""} name="description" rows={5} />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="form-actions">
        <button className="button button-primary" type="submit">
          {mode === "create" ? "Create project" : "Save changes"}
        </button>
        <Link className="button button-secondary button-link" href={project ? `/projects/${project.id}` : "/projects"}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
