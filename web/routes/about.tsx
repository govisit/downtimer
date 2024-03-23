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

export default function About() {
  return (
    <>
      <Head>
        <title>dtimer - About</title>
      </Head>
      <h1 class="hidden">About</h1>
      <Shell lines={lines} />
    </>
  );
}
