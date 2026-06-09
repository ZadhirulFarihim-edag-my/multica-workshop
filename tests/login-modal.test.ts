import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LoginEntry } from "../src/components/auth/login-entry";
import { LoginModal } from "../src/components/auth/login-modal";

describe("LoginEntry", () => {
  it("renders a login trigger in its default state", () => {
    const markup = renderToStaticMarkup(createElement(LoginEntry));

    expect(markup).toContain(">Log in<");
    expect(markup).not.toContain('role="dialog"');
  });
});

describe("LoginModal", () => {
  it("renders the requested auth fields and actions when open", () => {
    const markup = renderToStaticMarkup(
      createElement(LoginModal, {
        isOpen: true,
        registerHref: "/register",
      }),
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain(">Username<");
    expect(markup).toContain('name="username"');
    expect(markup).toContain(">Password<");
    expect(markup).toContain('type="password"');
    expect(markup).toContain(">Log in<");
    expect(markup).toContain('href="/register"');
    expect(markup).toContain("Register user");
  });

  it("renders nothing while closed", () => {
    const markup = renderToStaticMarkup(
      createElement(LoginModal, {
        isOpen: false,
        registerHref: "/register",
      }),
    );

    expect(markup).toBe("");
  });
});
