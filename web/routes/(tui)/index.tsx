import { signal } from "@preact/signals";
import Shell from "../../islands/Shell.tsx";
import { Line, ValidPrompts } from "../../islands/ShellLine.tsx";
import { getTimestamp } from "../../islands/ShellPrompt.tsx";
import { Head } from "fresh/runtime";
import {
  getLatestDownloadAssets,
  getLatestReleaseForHeader,
} from "../../github.ts";
import { define } from "../../utils.ts";
import { RouteConfig } from "fresh";
import Header from "../../components/header.tsx";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

const lines = signal<Line[]>([
  {
    timestamp: getTimestamp(),
    prompt: ValidPrompts.About,
  },
  {
    timestamp: getTimestamp(),
    prompt: ValidPrompts.Features,
  },
  {
    timestamp: getTimestamp(),
    prompt: ValidPrompts.Download,
  },
]);

const history = signal(
  lines.value
    .map((line) => line.prompt)
    // Sorts prompts from latest to oldest. The latest prompt is first.
    .toReversed(),
);

export default define.page(async function Home() {
  const downloadAssets = await getLatestDownloadAssets();
  const latestRelease = await getLatestReleaseForHeader();

  return (
    <>
      <Head>
        <title>DownTimer - When your phone or PC timer is not enough</title>
      </Head>
      <div class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 flex flex-col font-mono h-screen">
        <Header latestRelease={latestRelease} />
        <main class="mt-10 h-full h-full overflow-hidden">
          <h1 class="hidden">Home</h1>
          <Shell lines={lines} history={history} assets={downloadAssets} />
        </main>
      </div>
    </>
  );
});
