import { signal } from "@preact/signals";
import Shell from "../islands/Shell.tsx";
import { Line, ValidPrompts } from "../islands/ShellLine.tsx";
import { getTimestamp } from "../islands/ShellPrompt.tsx";
import { Head } from "$fresh/runtime.ts";

const lines = signal<Line[]>([
  {
    timestamp: getTimestamp(),
    prompt: ValidPrompts.Download,
  },
]);

export default function Download() {
  return (
    <>
      <Head>
        <title>dtimer - Download</title>
      </Head>
      <h1 class="hidden">Download</h1>
      <Shell lines={lines} />
    </>
  );
}
