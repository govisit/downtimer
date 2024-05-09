import { join } from "@std/path";
import { dir, DirectoryTypes } from "@cross/dir";

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
  switch (purpose) {
    case DatabasePurpose.Testing:
      return getTestingDataDir();
    case DatabasePurpose.Normal:
      return await getNormalDataDir();
    default: {
      const _exhaustiveCheck: never = purpose;
      return _exhaustiveCheck;
    }
  }
}

function getDbName(
  purpose: DatabasePurpose,
): string {
  switch (purpose) {
    case DatabasePurpose.Testing:
      return "test.db";
    case DatabasePurpose.Normal:
      return "dt.db";
    default: {
      const _exhaustiveCheck: never = purpose;
      return _exhaustiveCheck;
    }
  }
}

export async function getDatabaseConnection(
  purpose: DatabasePurpose = DatabasePurpose.Normal,
): Promise<Deno.Kv> {
  const dataDir = await getDataDir(purpose);
  const dbName = getDbName(purpose);

  return await Deno.openKv(dataDir ? join(dataDir, dbName) : undefined);
}

export async function databaseCleanup(kv: Deno.Kv): Promise<void> {
  for await (const res of kv.list({ prefix: [] })) {
    await kv.delete(res.key);
  }
}
