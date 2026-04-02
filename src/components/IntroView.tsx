import type { Intro, LinkItem } from "@/lib/types";
import styles from "./IntroView.module.css";

interface IntroViewProps {
  intro: Intro;
}

export default function IntroView({ intro }: IntroViewProps) {
  const links: LinkItem[] = intro.links ? JSON.parse(intro.links) : [];

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
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
      {intro.freeform && <p className={styles.freeform}>{intro.freeform}</p>}
    </div>
  );
}
