"use client";

import React, { useEffect, useState } from "react";
import { LoginModal } from "./login-modal";

export function LoginEntry() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button className="button button-secondary auth-trigger" onClick={() => setIsOpen(true)} type="button">
        Log in
      </button>
      <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
