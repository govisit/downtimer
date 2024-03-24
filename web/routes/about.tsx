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
]);

const history = signal(
  lines.value
    .map((line) => line.prompt)
    // Sorts prompts from latest to oldest. The latest prompt is first.
    .toReversed(),
);

export default function About() {
  return (
    <>
      <Head>
        <title>dtimer - About</title>
      </Head>
      <h1 class="hidden">About</h1>
      <Shell lines={lines} history={history} />
    </>
  );
}
