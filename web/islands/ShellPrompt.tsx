import ReturnIcon from "../components/icons/return-icon.tsx";
import { Signal, signal } from "@preact/signals-core";
import { Line } from "./ShellLine.tsx";
import { forwardRef } from "preact/compat";

export function getTimestamp(): string {
  return (new Date()).toLocaleTimeString("hr-hr", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ShellPromptProps = {
  onReturn: (line: Line) => void;
  prompt: Signal<string>;
  scrollToBottom: () => void;
  history: string[];
};

const promptValidationError = signal<string | undefined>(undefined);

const historyIndex = signal<number>(0);

const ShellPrompt = forwardRef<HTMLInputElement, ShellPromptProps>(
  ({ onReturn, prompt, scrollToBottom, history }, ref) => {
    return (
      <div class="flex flex-col gap-2">
        <div class="text-red-600 dark:text-red-400 text-sm">
          {promptValidationError.value || <>&nbsp;</>}
        </div>
        <form
          class="bg-gray-300 dark:bg-gray-700 rounded-lg px-8 py-5 flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();

            if (!prompt.value.trim().length) {
              scrollToBottom();

              promptValidationError.value = "Please enter a command.";

              return;
            }

            onReturn({
              timestamp: getTimestamp(),
              prompt: prompt.value,
            });

            prompt.value = "";
            historyIndex.value = 0;
          }}
        >
          <label for="shell-prompt" class="text-gray-700 dark:text-gray-300">
            ~dt$
          </label>
          <input
            ref={ref}
            autofocus
            onKeyDown={(event) => {
              if (["ArrowUp", "ArrowDown"].includes(event.key)) {
                event.preventDefault();
              }

              if (
                event.key === "ArrowUp" && history.length &&
                historyIndex.value < history.length - 1
              ) {
                historyIndex.value++;

                prompt.value = history.at(historyIndex.value)!;

                return;
              }

              if (
                event.key === "ArrowDown" && history.length &&
                historyIndex.value > 0
              ) {
                historyIndex.value--;

                prompt.value = history.at(historyIndex.value)!;

                return;
              }
            }}
            id="shell-prompt"
            value={prompt}
            onInput={(event) => {
              prompt.value = event.currentTarget.value;
              promptValidationError.value = undefined;
            }}
            type="text"
            placeholder="type 'help' for more commands"
            autocomplete="off"
            class="grow bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200"
          />
          <button
            type="submit"
            class="text-gray-700 dark:text-gray-300 px-2"
            title="Return"
          >
            <ReturnIcon />
          </button>
        </form>
      </div>
    );
  },
);

export default ShellPrompt;
