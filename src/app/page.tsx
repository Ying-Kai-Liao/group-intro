import db, { initDb, rowToIntro } from "@/lib/db";
import Desktop from "@/components/Desktop";

export const dynamic = "force-dynamic";

export default async function Home() {
  await initDb();
  const result = await db.execute("SELECT * FROM intros ORDER BY created_at ASC");
  const intros = result.rows.map(rowToIntro);

  return <Desktop initialIntros={intros} />;
}
