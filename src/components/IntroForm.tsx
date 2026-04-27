"use client";

import { useState } from "react";
import type { Intro, IntroInput } from "@/lib/types";
import IconPicker from "./IconPicker";
import ColorPicker from "./ColorPicker";
import { DEFAULT_COLOR } from "@/data/colors";
import styles from "./IntroForm.module.css";

interface IntroFormProps {
  onSubmit: (intro: Intro) => void;
  editIntro?: Intro;
  editAuth?: { email: string; password: string };
}

export default function IntroForm({ onSubmit, editIntro, editAuth }: IntroFormProps) {
  const isEditMode = !!(editIntro && editAuth);

  const parsedLinks = editIntro?.links
    ? (JSON.parse(editIntro.links) as { label: string; url: string }[])
    : [];

  const [name, setName] = useState(editIntro?.name ?? "");
  const [icon, setIcon] = useState(editIntro?.icon ?? "folder");
  const [avatar, setAvatar] = useState<string | null>(editIntro?.avatar ?? null);
  const [bio, setBio] = useState(editIntro?.bio ?? "");
  const [links, setLinks] = useState<{ label: string; url: string }[]>(parsedLinks);
  const [freeform, setFreeform] = useState(editIntro?.freeform ?? "");
  const [color, setColor] = useState(editIntro?.color ?? DEFAULT_COLOR);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      const MAX = 200 * 1024;

      // Start at original dimensions, scale down if needed
      let width = img.width;
      let height = img.height;

      // Shrink dimensions iteratively until under 200KB
      const tryEncode = (w: number, h: number, quality: number): string => {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        return canvas.toDataURL("image/jpeg", quality);
      };

      let quality = 0.9;
      let dataUrl = tryEncode(width, height, quality);

      // Reduce quality first
      while (dataUrl.length * 0.75 > MAX && quality > 0.2) {
        quality -= 0.1;
        dataUrl = tryEncode(width, height, quality);
      }

      // Then shrink dimensions if still too large
      while (dataUrl.length * 0.75 > MAX && (width > 100 || height > 100)) {
        width = Math.floor(width * 0.8);
        height = Math.floor(height * 0.8);
        dataUrl = tryEncode(width, height, quality);
      }

      setAvatar(dataUrl);
      setError(null);
    };
    img.src = objectUrl;
  };

  const addLink = () => {
    if (links.length >= 5) return;
    setLinks([...links, { label: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: IntroInput = {
      name: name.trim(),
      icon,
      avatar,
      bio: bio.trim() || null,
      links: links.filter((l) => l.label.trim() && l.url.trim()),
      freeform: freeform.trim() || null,
      color,
    };

    if (!isEditMode) {
      // Only include email/password on create
      if (email.trim()) {
        payload.email = email.trim();
        payload.password = password;
      }
    }

    try {
      let res: Response;

      if (isEditMode) {
        res = await fetch(`/api/intros/${editIntro.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            email: editAuth.email,
            password: editAuth.password,
          }),
        });
      } else {
        res = await fetch("/api/intros", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.[0]?.message || data.error || "Something went wrong");
        return;
      }

      const intro: Intro = await res.json();
      onSubmit(intro);
    } catch {
      setError("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>Name *</label>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
        />
        <span className={styles.charCount}>{name.length}/50</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Icon</label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Avatar (under 200KB)</label>
        {avatar && <img src={avatar} alt="Preview" className={styles.avatarPreview} />}
        <input type="file" accept="image/*" onChange={handleAvatarChange} className={styles.input} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Bio</label>
        <textarea
          className={styles.textarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
        />
        <span className={styles.charCount}>{bio.length}/280</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Links ({links.length}/5)</label>
        {links.map((link, i) => (
          <div key={i} className={styles.linkRow}>
            <input
              className={`${styles.input} ${styles.linkInput}`}
              placeholder="Label"
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              maxLength={50}
            />
            <input
              className={`${styles.input} ${styles.linkInput}`}
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              maxLength={500}
            />
            <button type="button" className={styles.removeLink} onClick={() => removeLink(i)}>
              X
            </button>
          </div>
        ))}
        {links.length < 5 && (
          <button type="button" className={styles.addLink} onClick={addLink}>
            + Add link
          </button>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Freeform</label>
        <textarea
          className={styles.textarea}
          value={freeform}
          onChange={(e) => setFreeform(e.target.value)}
          maxLength={2000}
          rows={4}
        />
        <span className={styles.charCount}>{freeform.length}/2000</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Window Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {!isEditMode && (
        <div className={styles.authSection}>
          <p className={styles.authHint}>
            Set email + password to edit or delete your intro later (optional)
          </p>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={100}
              placeholder="Min 4 characters"
              autoComplete="new-password"
            />
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submitButton} disabled={submitting || !name.trim()}>
        {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Submit"}
      </button>
    </form>
  );
}
