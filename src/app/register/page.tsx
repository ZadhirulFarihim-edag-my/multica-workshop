import Link from "next/link";
import { PageHeader } from "../../components/ui/page-header";
import { Panel } from "../../components/ui/panel";

export default function RegisterPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Access"
        title="Register user"
        description="Create a new workspace profile before signing in to the command center."
      />

      <Panel eyebrow="Next step" title="Registration flow placeholder">
        <div className="register-panel">
          <p className="page-description">
            Registration is not wired to a backend yet, but this route gives the login
            modal a valid destination for the register action.
          </p>
          <Link className="button button-primary button-link" href="/">
            Return to dashboard
          </Link>
        </div>
      </Panel>
    </div>
  );
}
