"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", description: "Overview and live status" },
  { href: "/projects", label: "Projects", description: "Portfolio and ownership" },
  { href: "/tasks", label: "Tasks", description: "Delivery and priorities" },
  { href: "/team", label: "Team", description: "Members and capacity" },
] as const;

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary">
      <ul className="nav-list">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={`nav-link${active ? " nav-link-active" : ""}`}
                href={item.href}
              >
                <span className="nav-link-label">{item.label}</span>
                <span className="nav-link-description">{item.description}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
