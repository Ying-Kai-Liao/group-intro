export interface Intro {
  id: number;
  name: string;
  icon: string;
  avatar: string | null;
  bio: string | null;
  links: string | null; // JSON string of {label: string, url: string}[]
  freeform: string | null;
  color: string | null;
  created_at: string;
}

export interface IntroInput {
  name: string;
  icon?: string;
  avatar?: string | null;
  bio?: string | null;
  links?: { label: string; url: string }[];
  freeform?: string | null;
  color?: string | null;
}

export interface LinkItem {
  label: string;
  url: string;
}
