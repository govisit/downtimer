import { Octokit } from "octokit";
import { Endpoints } from "octokit/types";
import { Asset, Release } from "./types.ts";
import { Match } from "effect";
import { packageInfo } from "@downtimer/cli/stats";

const octokit = new Octokit({
  auth: Deno.env.get("GITHUB_TOKEN"),
});

const LATEST_RELEASE_KEY = ["latest-release-key-2"];

const LATEST_RELEASE_EXPIRE_IN = 60000; // 1 minute

const latestReleaseName = `v${packageInfo.version}-cli`;

export const latestRelease = {
  name: latestReleaseName,
  url: `https://github.com/govisit/downtimer/releases/tag/${latestReleaseName}`,
} satisfies Release;

const fetchLatestRelease = async (): Promise<
  Endpoints["GET /repos/{owner}/{repo}/releases/tags/{tag}"]["response"]["data"]
> => {
  const result = await octokit.request(
    `GET /repos/{owner}/{repo}/releases/tags/{tag}`,
    {
      owner: "govisit",
      repo: "downtimer",
      tag: latestRelease.name,
      headers: {
        "X-GitHub-Api-Version": "2026-03-10",
      },
    },
  );

  return result.data;
};

const cacheDownloadAssets = async (
  kv: Deno.Kv,
  assets: Asset[],
): Promise<void> => {
  await kv.set(
    LATEST_RELEASE_KEY,
    {
      assets,
      expiresAt: Date.now() + LATEST_RELEASE_EXPIRE_IN,
    } satisfies DownloadAssetsCached,
    {
      expireIn: LATEST_RELEASE_EXPIRE_IN,
    },
  );
};

const fetchLatestReleaseAndCacheDownloadAssets = async (
  kv: Deno.Kv,
): Promise<Asset[]> => {
  console.log("Fetching latest release from github.");

  const latestRelease = await fetchLatestRelease();

  const downloadAssets: Asset[] = latestRelease.assets.map((asset) => {
    return {
      name: asset.name,
      url: asset.browser_download_url,
    } satisfies Asset;
  });

  await cacheDownloadAssets(kv, downloadAssets);

  console.log("Cached latest release download assets.");

  return downloadAssets;
};

type DownloadAssetsCached = {
  assets: Asset[];
  expiresAt: number;
};

export async function getDownloadAssetsForLatestRelease(): Promise<Asset[]> {
  const kv = await Deno.openKv();

  const latestRelease_cached = await kv.get<DownloadAssetsCached>(
    LATEST_RELEASE_KEY,
  );

  return Match.value(latestRelease_cached).pipe(
    Match.when(
      { value: Match.null },
      () => fetchLatestReleaseAndCacheDownloadAssets(kv),
    ),
    Match.when({ value: (_) => _.expiresAt > Date.now() }, (latestRelease) => {
      console.log("Retrieving latest release download assets from cache.");

      return latestRelease.value.assets;
    }),
    Match.orElse(() => fetchLatestReleaseAndCacheDownloadAssets(kv)),
  );
}
