import { signal } from "@preact/signals";
import Shell from "../islands/Shell.tsx";
import { Line, ValidPrompts } from "../islands/ShellLine.tsx";
import { getTimestamp } from "../islands/ShellPrompt.tsx";
import { Head } from "$fresh/runtime.ts";

const lines = signal<Line[]>([
  {
    timestamp: getTimestamp(),
    prompt: ValidPrompts.Features,
  },
]);

export default function Features() {
  return (
    <>
      <Head>
        <title>dtimer - Features</title>
      </Head>
      <h1 class="hidden">Features</h1>
      <Shell lines={lines} />
    </>
  );
}
