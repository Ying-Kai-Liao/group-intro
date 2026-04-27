"use client";

import { useState } from "react";
import type { Intro, LinkItem } from "@/lib/types";
import IntroForm from "./IntroForm";
import styles from "./IntroView.module.css";

interface IntroViewProps {
  intro: Intro;
  onOpenLink?: (url: string, label: string) => void;
  onDelete?: (id: number) => void;
  onUpdate?: (intro: Intro) => void;
}

type AuthAction = "edit" | "delete" | null;

export default function IntroView({ intro, onOpenLink, onDelete, onUpdate }: IntroViewProps) {
  const links: LinkItem[] = intro.links ? JSON.parse(intro.links) : [];

  const [authAction, setAuthAction] = useState<AuthAction>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editAuth, setEditAuth] = useState<{ email: string; password: string } | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleAuthAction = (action: AuthAction) => {
    setAuthAction(action);
    setAuthEmail("");
    setAuthPassword("");
    setAuthError(null);
    setForgotMode(false);
    setForgotSent(false);
  };

  const handleForgotPassword = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } catch {
      setAuthError("Network error. Try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDelete = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch(`/api/intros/${intro.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      if (res.status === 204) {
        onDelete?.(intro.id);
      } else {
        const data = await res.json();
        setAuthError(data.error || "Failed to delete");
      }
    } catch {
      setAuthError("Network error. Try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEditAuth = () => {
    setAuthError(null);
    // We'll verify credentials by attempting the PUT request from the form
    // Instead, let's pre-verify by trying a no-op check approach:
    // Actually, just proceed to edit mode — the PUT will fail with 401 if wrong
    setEditAuth({ email: authEmail, password: authPassword });
    setEditMode(true);
    setAuthAction(null);
  };

  const handleEditSubmit = (updated: Intro) => {
    setEditMode(false);
    setEditAuth(null);
    onUpdate?.(updated);
  };

  // If in edit mode, show the edit form
  if (editMode && editAuth) {
    return (
      <div className={styles.intro}>
        <IntroForm
          onSubmit={handleEditSubmit}
          editIntro={intro}
          editAuth={editAuth}
        />
        <button
          className={styles.cancelButton}
          onClick={() => { setEditMode(false); setEditAuth(null); }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={styles.intro}>
      {intro.avatar && (
        <img src={intro.avatar} alt={intro.name} className={styles.avatar} />
      )}
      <h2 className={styles.name}>{intro.name}</h2>
      {intro.bio && <p className={styles.bio}>{intro.bio}</p>}
      {links.length > 0 && (
        <div className={styles.links}>
          {links.map((link, i) => (
            <button
              key={i}
              className={styles.link}
              onClick={() => onOpenLink?.(link.url, link.label)}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
      {intro.freeform && <p className={styles.freeform}>{intro.freeform}</p>}

      {/* Edit / Delete section */}
      {authAction === null && (
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={() => handleAuthAction("edit")}>
            Edit
          </button>
          <button
            className={`${styles.actionButton} ${styles.actionButtonDanger}`}
            onClick={() => handleAuthAction("delete")}
          >
            Delete
          </button>
        </div>
      )}

      {authAction !== null && (
        <div className={styles.authPrompt}>
          {!forgotMode ? (
            <>
              <p className={styles.authPromptLabel}>
                {authAction === "edit" ? "Authenticate to edit" : "Authenticate to delete"}
              </p>
              <input
                className={styles.authInput}
                type="email"
                placeholder="Email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                className={styles.authInput}
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                autoComplete="current-password"
              />
              {authError && <p className={styles.authError}>{authError}</p>}
              <div className={styles.authButtons}>
                <button
                  className={styles.authConfirm}
                  disabled={authLoading || !authEmail || !authPassword}
                  onClick={authAction === "delete" ? handleDelete : handleEditAuth}
                >
                  {authLoading ? "..." : authAction === "delete" ? "Delete" : "Edit"}
                </button>
                <button
                  className={styles.authCancel}
                  onClick={() => setAuthAction(null)}
                >
                  Cancel
                </button>
              </div>
              <button
                className={styles.forgotLink}
                onClick={() => { setForgotMode(true); setForgotEmail(authEmail); setAuthError(null); }}
              >
                Forgot password?
              </button>
            </>
          ) : (
            <>
              <p className={styles.authPromptLabel}>Reset Password</p>
              {forgotSent ? (
                <p className={styles.authSuccess}>Check your email for a reset link!</p>
              ) : (
                <>
                  <input
                    className={styles.authInput}
                    type="email"
                    placeholder="Your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    autoComplete="email"
                  />
                  {authError && <p className={styles.authError}>{authError}</p>}
                  <div className={styles.authButtons}>
                    <button
                      className={styles.authConfirm}
                      disabled={authLoading || !forgotEmail}
                      onClick={handleForgotPassword}
                    >
                      {authLoading ? "..." : "Send Reset Email"}
                    </button>
                    <button
                      className={styles.authCancel}
                      onClick={() => setForgotMode(false)}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
