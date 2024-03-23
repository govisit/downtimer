import ReturnIcon from "../components/icons/return-icon.tsx";
import { Signal, signal } from "@preact/signals-core";
import { Line } from "./ShellLine.tsx";
import { Ref } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

export function getTimestamp(): string {
  return (new Date()).toLocaleTimeString("hr-hr", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ShellPromptProps = {
  onReturn: (line: Line) => void;
  prompt: Signal<string>;
  ref: Ref<HTMLInputElement>;
};

const promptValidationError = signal<string | undefined>(undefined);

export default function ShellPrompt(
  { onReturn, prompt, ref }: ShellPromptProps,
) {
  return (
    <div class="flex flex-col gap-2">
      <div class="text-red-500 text-sm">
        {promptValidationError.value || <>&nbsp;</>}
      </div>
      <form
        class="bg-[#394253] rounded-lg px-8 py-5 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();

          if (!prompt.value.trim().length) {
            promptValidationError.value = "Please enter a command.";

            return;
          }

          onReturn({
            timestamp: getTimestamp(),
            prompt: prompt.value,
          });

          prompt.value = "";
        }}
      >
        <label for="shell-prompt" class="text-[#DAD4C6]">~dtimer$</label>
        <input
          ref={ref}
          autofocus
          id="shell-prompt"
          value={prompt}
          onInput={(event) => {
            prompt.value = event.currentTarget.value;
            promptValidationError.value = undefined;
          }}
          type="text"
          placeholder="type 'help' for more commands"
          autocomplete="off"
          class="grow bg-[#394253] border-none p-0 focus:ring-0 text-[#FAF7E8]"
        />
        <button type="submit" class="text-[#FEFEF4] px-2" title="Return">
          <ReturnIcon />
        </button>
      </form>
    </div>
  );
}
