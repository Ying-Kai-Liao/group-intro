"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setMessage("Password must be at least 4 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Password updated! You can close this page.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Failed to reset password.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.box}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.error}>Invalid reset link. Please request a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.titleBar}>
          <span>Reset Password</span>
        </div>
        <div className={styles.content}>
          {status === "success" ? (
            <p className={styles.success}>{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>New Password</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 4 characters"
                autoComplete="new-password"
                required
              />
              <label className={styles.label}>Confirm Password</label>
              <input
                className={styles.input}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
              {status === "error" && <p className={styles.error}>{message}</p>}
              <button
                className={styles.button}
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Saving..." : "Set New Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
