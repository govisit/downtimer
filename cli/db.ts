/// <reference lib="deno.unstable" />

export async function getDatabaseConnection(
  path: string | undefined = undefined,
): Promise<Deno.Kv> {
  return await Deno.openKv(path);
}
