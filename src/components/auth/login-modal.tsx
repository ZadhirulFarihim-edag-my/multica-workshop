import React from "react";
import Link from "next/link";

type LoginModalProps = {
  isOpen: boolean;
  registerHref?: string;
  onClose?: () => void;
};

export function LoginModal({
  isOpen,
  registerHref = "/register",
  onClose,
}: LoginModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-labelledby="login-modal-title"
        aria-modal="true"
        className="auth-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div>
            <p className="eyebrow">Workspace access</p>
            <h2 className="auth-modal-title" id="login-modal-title">
              Log in
            </h2>
            <p className="auth-modal-copy">
              Enter your username and password to open the command center.
            </p>
          </div>
          <button
            aria-label="Close login modal"
            className="auth-close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form className="auth-form">
          <div className="field">
            <label className="field-label" htmlFor="login-username">
              Username
            </label>
            <input
              autoComplete="username"
              className="input"
              id="login-username"
              name="username"
              placeholder="jane.doe"
              type="text"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="input"
              id="login-password"
              name="password"
              placeholder="Enter your password"
              type="password"
            />
          </div>

          <div className="auth-modal-footer">
            <button className="button button-primary" type="submit">
              Log in
            </button>
            <Link className="auth-register-link" href={registerHref}>
              Register user
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
