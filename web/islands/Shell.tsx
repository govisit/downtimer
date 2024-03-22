import { useEffect, useRef } from "preact/hooks";
import ShellLine, { Line } from "./ShellLine.tsx";
import ShellPrompt from "./ShellPrompt.tsx";
import { Signal, signal } from "@preact/signals";

const prompt = signal("");

type ShellProps = {
  lines: Signal<Line[]>;
};

const initialLoad = signal(true);

export default function Shell({ lines }: ShellProps) {
  const linesRef = useRef<HTMLDivElement>(null);

  function addNewLine(line: Line): void {
    lines.value = [...lines.value, line];
  }

  useEffect(() => {
    if (linesRef.current && !initialLoad.value) {
      linesRef.current.scrollTo({
        behavior: "smooth",
        top: linesRef.current.scrollHeight,
      });
    }
  }, [lines.value, linesRef]);

  function setShellPrompt(prompt0: string) {
    prompt.value = prompt0;
  }

  useEffect(() => {
    initialLoad.value = false;
  }, []);

  return (
    <div class="flex flex-col justify-between h-full gap-10">
      <div
        ref={linesRef}
        class="flex flex-col gap-4 grow overflow-y-auto pr-12"
      >
        {lines.value.map((line) => {
          return <ShellLine line={line} setShellPrompt={setShellPrompt} />;
        })}
      </div>
      <ShellPrompt onReturn={addNewLine} prompt={prompt} />
    </div>
  );
}
