import { IntroInput } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateIntroInput(input: unknown): {
  data: IntroInput | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return { data: null, errors: [{ field: "body", message: "Invalid request body" }] };
  }

  const body = input as Record<string, unknown>;

  // Name: required, ≤ 50 chars
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (body.name.length > 50) {
    errors.push({ field: "name", message: "Name must be 50 characters or less" });
  }

  // Bio: optional, ≤ 280 chars
  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== "string" || body.bio.length > 280) {
      errors.push({ field: "bio", message: "Bio must be 280 characters or less" });
    }
  }

  // Freeform: optional, ≤ 2000 chars
  if (body.freeform !== undefined && body.freeform !== null) {
    if (typeof body.freeform !== "string" || body.freeform.length > 2000) {
      errors.push({ field: "freeform", message: "Freeform must be 2000 characters or less" });
    }
  }

  // Links: optional, max 5, each label ≤ 50, URL ≤ 500
  if (body.links !== undefined && body.links !== null) {
    if (!Array.isArray(body.links)) {
      errors.push({ field: "links", message: "Links must be an array" });
    } else if (body.links.length > 5) {
      errors.push({ field: "links", message: "Maximum 5 links allowed" });
    } else {
      for (let i = 0; i < body.links.length; i++) {
        const link = body.links[i];
        if (!link.label || typeof link.label !== "string" || link.label.length > 50) {
          errors.push({ field: `links[${i}].label`, message: "Link label must be 1-50 characters" });
        }
        if (!link.url || typeof link.url !== "string" || link.url.length > 500) {
          errors.push({ field: `links[${i}].url`, message: "Link URL must be 1-500 characters" });
        }
      }
    }
  }

  // Avatar: optional, base64, ≤ 270KB
  if (body.avatar !== undefined && body.avatar !== null) {
    if (typeof body.avatar !== "string") {
      errors.push({ field: "avatar", message: "Avatar must be a string" });
    } else if (body.avatar.length > 270 * 1024) {
      errors.push({ field: "avatar", message: "Avatar data must be under 270KB (encode a file under 200KB)" });
    }
  }

  // Icon: optional string
  if (body.icon !== undefined && body.icon !== null && typeof body.icon !== "string") {
    errors.push({ field: "icon", message: "Icon must be a string" });
  }

  // Color: optional hex string
  if (body.color !== undefined && body.color !== null) {
    if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
      errors.push({ field: "color", message: "Color must be a valid hex color (e.g. #ff6b6b)" });
    }
  }

  // Email: optional, but if provided must be valid format, max 100 chars
  const hasEmail = body.email !== undefined && body.email !== null && body.email !== "";
  const hasPassword = body.password !== undefined && body.password !== null && body.password !== "";

  if (hasEmail) {
    if (typeof body.email !== "string" || body.email.length > 100) {
      errors.push({ field: "email", message: "Email must be 100 characters or less" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push({ field: "email", message: "Email must be a valid email address" });
    }
  }

  // Password: optional, but if provided must be 4+ chars, max 100 chars
  if (hasPassword) {
    if (typeof body.password !== "string" || body.password.length < 4) {
      errors.push({ field: "password", message: "Password must be at least 4 characters" });
    } else if (body.password.length > 100) {
      errors.push({ field: "password", message: "Password must be 100 characters or less" });
    }
  }

  // Email and password must be provided together
  if (hasEmail && !hasPassword) {
    errors.push({ field: "password", message: "Password is required when email is provided" });
  }
  if (hasPassword && !hasEmail) {
    errors.push({ field: "email", message: "Email is required when password is provided" });
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name: (body.name as string).trim(),
      icon: (body.icon as string) || undefined,
      avatar: (body.avatar as string) || null,
      bio: (body.bio as string) || null,
      links: body.links as { label: string; url: string }[] | undefined,
      freeform: (body.freeform as string) || null,
      color: (body.color as string) || null,
      email: hasEmail ? (body.email as string) : null,
      password: hasPassword ? (body.password as string) : null,
    },
    errors: [],
  };
}
