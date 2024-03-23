import { signal } from "@preact/signals";
import Shell from "../islands/Shell.tsx";
import { Line, ValidPrompts } from "../islands/ShellLine.tsx";
import { getTimestamp } from "../islands/ShellPrompt.tsx";
import { Head } from "$fresh/runtime.ts";

const lines = signal<Line[]>([
  {
    timestamp: getTimestamp(),
    prompt: ValidPrompts.Privacy,
  },
]);

export default function Privacy() {
  return (
    <>
      <Head>
        <title>dtimer - Privacy</title>
      </Head>
      <h1 class="hidden">Privacy</h1>
      <Shell lines={lines} />
    </>
  );
}
