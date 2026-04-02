"use client";

import { useState } from "react";
import type { Intro, IntroInput } from "@/lib/types";
import IconPicker from "./IconPicker";
import ColorPicker from "./ColorPicker";
import { DEFAULT_COLOR } from "@/data/colors";
import styles from "./IntroForm.module.css";

interface IntroFormProps {
  onSubmit: (intro: Intro) => void;
}

export default function IntroForm({ onSubmit }: IntroFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("folder");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [freeform, setFreeform] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      setError("Avatar must be under 200KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
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

    try {
      const res = await fetch("/api/intros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.[0]?.message || "Something went wrong");
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

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submitButton} disabled={submitting || !name.trim()}>
        {submitting ? "Saving..." : "Submit"}
      </button>
    </form>
  );
}
