/// <reference lib="deno.unstable" />

export async function getDatabaseConnection(
  path: string | undefined = undefined,
): Promise<Deno.Kv> {
  return await Deno.openKv(path);
}

export async function databaseCleanup(kv: Deno.Kv): Promise<void> {
  for await (const res of kv.list({ prefix: [] })) {
    await kv.delete(res.key);
  }
}
