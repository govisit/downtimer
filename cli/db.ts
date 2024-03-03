import dir from "$deno_dirs";
import { join } from "$std/path/mod.ts";

// TODO: Testing requires setting path for the database.
export async function getDatabaseConnection(): Promise<Deno.Kv> {
  const homeDir = dir("home");

  const dataDir = homeDir ? join(homeDir, ".dtimer") : undefined;

  if (dataDir) {
    await Deno.mkdir(dataDir, { recursive: true });
  }

  return await Deno.openKv(dataDir ? join(dataDir, "dtimer.db") : undefined);
}

export async function databaseCleanup(kv: Deno.Kv): Promise<void> {
  for await (const res of kv.list({ prefix: [] })) {
    await kv.delete(res.key);
  }
}
