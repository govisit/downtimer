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
  const shellPromptRef = useRef<HTMLInputElement>(null);

  function addNewLine(line: Line): void {
    lines.value = [...lines.value, line];
  }

  function scrollToBottom() {
    if (linesRef.current) {
      linesRef.current.scrollTo({
        behavior: "smooth",
        top: linesRef.current.scrollHeight,
      });
    }
  }

  useEffect(() => {
    if (!initialLoad.value) {
      scrollToBottom();
    }
  }, [lines.value, linesRef.current]);

  function setShellPrompt(prompt0: string) {
    prompt.value = prompt0;

    if (shellPromptRef.current) {
      shellPromptRef.current.focus();
    }
  }

  useEffect(() => {
    function handleClearKeybinding(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === "l") {
        event.preventDefault();

        console.log("hmm");

        clearLines();
      }
    }

    globalThis.document.addEventListener("keydown", handleClearKeybinding);

    return () => {
      globalThis.document.removeEventListener(
        "keydown",
        handleClearKeybinding,
      );
    };
  }, []);

  useEffect(() => {
    initialLoad.value = false;
  }, []);

  function clearLines() {
    lines.value = [];
  }

  return (
    <div class="flex flex-col justify-between h-full gap-8">
      <div
        ref={linesRef}
        class="flex flex-col gap-4 grow overflow-y-auto pr-6 sm:pr-12"
      >
        {lines.value.map((line, index) => {
          return (
            <ShellLine
              key={index}
              line={line}
              setShellPrompt={setShellPrompt}
              clearLines={clearLines}
            />
          );
        })}
      </div>
      <ShellPrompt
        scrollToBottom={scrollToBottom}
        ref={shellPromptRef}
        onReturn={addNewLine}
        prompt={prompt}
      />
    </div>
  );
}
