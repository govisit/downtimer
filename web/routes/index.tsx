import { signal } from "@preact/signals";
import Shell from "../islands/Shell.tsx";
import { Line, ValidPrompts } from "../islands/ShellLine.tsx";
import { getTimestamp } from "../islands/ShellPrompt.tsx";
import { Head } from "$fresh/runtime.ts";

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

export default function Home() {
  return (
    <>
      <Head>
        <title>dtimer - When your phone or PC timer is not enough</title>
      </Head>
      <h1 class="hidden">Home</h1>
      <Shell lines={lines} history={history} />
    </>
  );
}
