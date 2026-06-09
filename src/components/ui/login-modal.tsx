"use client";
import type { FormEvent } from "react";
import { useState } from "react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // In this workshop app there is no real auth backend yet.
    // For now we only close the modal to demonstrate the interaction.
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="login-modal-title" className="modal-title">
            Sign in
          </h2>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="field-input"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input"
              required
            />
          </div>

          <div className="modal-footer">
            <button type="submit" className="button button-primary">
              Log in
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>

        <footer className="modal-secondary">
          <button type="button" className="link-button">
            Register new user
          </button>
        </footer>
      </div>
    </div>
  );
}
