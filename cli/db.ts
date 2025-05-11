import { join } from "@std/path";
import { dir, DirectoryTypes } from "@cross/dir";
import { Match } from "effect";

export enum DatabasePurpose {
  Testing = "testing",
  Normal = "normal",
}

async function getNormalDataDir(): Promise<string | undefined> {
  const homeDir = await dir(DirectoryTypes.home);

  const dataDir = homeDir ? join(homeDir, ".dt") : undefined;

  if (dataDir) {
    await Deno.mkdir(dataDir, { recursive: true });
  }

  return dataDir;
}

function getTestingDataDir(): string {
  return "./";
}

async function getDataDir(
  purpose: DatabasePurpose,
): Promise<string | undefined> {
  return await Match.value(purpose).pipe(
    Match.when(DatabasePurpose.Testing, () => getTestingDataDir()),
    Match.when(DatabasePurpose.Normal, () => getNormalDataDir()),
    Match.exhaustive,
  );
}

function getDbName(
  purpose: DatabasePurpose,
): string {
  return Match.value(purpose).pipe(
    Match.when(DatabasePurpose.Testing, () => "test.db"),
    Match.when(DatabasePurpose.Normal, () => "dt.db"),
    Match.exhaustive,
  );
}

export async function getDatabaseConnection(
  purpose: DatabasePurpose = DatabasePurpose.Normal,
): Promise<Deno.Kv> {
  const dataDir = await getDataDir(purpose);
  const dbName = getDbName(purpose);

  return Deno.openKv(
    Match.value(dataDir).pipe(
      Match.when(Match.undefined, () => undefined),
      Match.when(Match.string, (dir) => join(dir, dbName)),
      Match.exhaustive,
    ),
  );
}

export async function databaseCleanup(kv: Deno.Kv): Promise<void> {
  for await (const res of kv.list({ prefix: [] })) {
    await kv.delete(res.key);
  }
}
