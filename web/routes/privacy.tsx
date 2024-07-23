import { signal } from "@preact/signals";
import Shell from "../islands/Shell.tsx";
import { Line, ValidPrompts } from "../islands/ShellLine.tsx";
import { getTimestamp } from "../islands/ShellPrompt.tsx";
import { Head } from "$fresh/runtime.ts";
import { getLatestDownloadAssets } from "../github.ts";

const lines = signal<Line[]>([
  {
    timestamp: getTimestamp(),
    prompt: ValidPrompts.Privacy,
  },
]);

const history = signal(
  lines.value
    .map((line) => line.prompt)
    // Sorts prompts from latest to oldest. The latest prompt is first.
    .toReversed(),
);

export default async function Privacy() {
  const downloadAssets = await getLatestDownloadAssets();

  return (
    <>
      <Head>
        <title>DownTimer - Privacy</title>
      </Head>
      <h1 class="hidden">Privacy</h1>
      <Shell lines={lines} history={history} assets={downloadAssets} />
    </>
  );
}
