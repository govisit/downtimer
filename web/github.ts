import { Octokit } from "octokit";
import { Endpoints } from "octokit/types";
import { Asset, Release } from "./types.ts";
import { Match } from "effect";

const octokit = new Octokit({
  auth: Deno.env.get("GITHUB_TOKEN"),
});

const LATEST_RELEASE_KEY = ["latest-release-key"];

const LATEST_RELEASE_EXPIRE_IN = 60000; // 1 minute

// NOTE: There is a bug in octokit/type or in octokit where `status` is of wrong type for some reason.
type ReleasesLatest =
  & Omit<
    Endpoints["GET /repos/{owner}/{repo}/releases/latest"]["response"],
    "status"
  >
  & { status: number };

const getLatest = async (): Promise<ReleasesLatest["data"]> => {
  const result: ReleasesLatest = await octokit.request(
    "GET /repos/govisit/downtimer/releases/latest",
    {
      owner: "govisit",
      repo: "downtimer",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  return result.data;
};

const cacheLatest = async (
  kv: Deno.Kv,
  latestRelease: ReleasesLatest["data"],
): Promise<void> => {
  await kv.set(LATEST_RELEASE_KEY, {
    latestRelease,
    expiresAt: Date.now() + LATEST_RELEASE_EXPIRE_IN,
  }, {
    expireIn: LATEST_RELEASE_EXPIRE_IN,
  });
};

const fetchLatestAndCache = async (
  kv: Deno.Kv,
): Promise<ReleasesLatest["data"]> => {
  console.log("Fetching latest release from github.");

  const latestRelease = await getLatest();

  await cacheLatest(kv, latestRelease);

  console.log("Cached latest release.");

  return latestRelease;
};

type LatestReleaseCached = {
  latestRelease: ReleasesLatest["data"];
  expiresAt: number;
};

export async function getLatestRelease(): Promise<ReleasesLatest["data"]> {
  const kv = await Deno.openKv();

  const latestRelease_cached = await kv.get<LatestReleaseCached>(
    LATEST_RELEASE_KEY,
  );

  return await Match.value(latestRelease_cached).pipe(
    Match.when({ value: Match.null }, () => fetchLatestAndCache(kv)),
    Match.when({ value: (_) => _.expiresAt > Date.now() }, (latestRelease) => {
      console.log("Retrieving latest release from cache.");

      return latestRelease.value.latestRelease;
    }),
    Match.orElse(() => fetchLatestAndCache(kv)),
  );
}

export async function getLatestReleaseForHeader(): Promise<Release> {
  const result = await getLatestRelease();

  const latestRelease: Release = {
    name: result.tag_name,
    url: result.html_url,
  };

  return latestRelease;
}

export async function getLatestDownloadAssets(): Promise<Asset[]> {
  const latestRelease = await getLatestRelease();

  const downloadAssets: Asset[] = latestRelease.assets.map((asset) => {
    return {
      name: asset.name,
      url: asset.browser_download_url,
    };
  });

  return downloadAssets;
}
