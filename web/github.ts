import { Octokit } from "octokit";
import { Endpoints } from "octokit/types";
import { Asset, Release } from "./types.ts";

const octokit = new Octokit({
  auth: Deno.env.get("GITHUB_TOKEN"),
});

// NOTE: There is a bug in octokit/type or in octokit where `status` is of wrong type for some reason.
type ReleasesLatest =
  & Omit<
    Endpoints["GET /repos/{owner}/{repo}/releases/latest"]["response"],
    "status"
  >
  & { status: number };

export async function getLatestRelease(): Promise<ReleasesLatest["data"]> {
  const result: ReleasesLatest = await octokit.request(
    "GET /repos/govisit/DownTimer-docs/releases/latest",
    {
      owner: "govisit",
      repo: "DownTimer-docs",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  return result.data;
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
