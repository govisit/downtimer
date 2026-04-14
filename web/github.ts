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

export async function getLatestRelease(): Promise<ReleasesLatest["data"]> {
  const kv = await Deno.openKv();

  const latestRelease_cached = await kv.get<ReleasesLatest["data"]>(
    LATEST_RELEASE_KEY,
  );

  return await Match.value(latestRelease_cached.value).pipe(
    Match.when(Match.null, async () => {
      console.log("Fetching latest release from github.");

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

      const latestRelease = result.data;

      await kv.set(LATEST_RELEASE_KEY, latestRelease, {
        expireIn: LATEST_RELEASE_EXPIRE_IN,
      });

      console.log("Caching latest release.");

      return latestRelease;
    }),
    Match.orElse((latestRelease) => {
      console.log("Retrieving latest release from cache.");

      return latestRelease;
    }),
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
