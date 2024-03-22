import ReturnIcon from "../components/icons/return-icon.tsx";
import { Signal } from "@preact/signals-core";
import { Line } from "./ShellLine.tsx";

export function getTimestamp(): string {
  return (new Date()).toLocaleTimeString("hr-hr", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ShellPromptProps = {
  onReturn: (line: Line) => void;
  prompt: Signal<string>;
};

export default function ShellPrompt(
  { onReturn, prompt }: ShellPromptProps,
) {
  return (
    <form
      class="bg-[#394253] rounded-lg px-8 py-5 flex gap-3"
      onSubmit={(e) => {
        e.preventDefault();

        onReturn({
          timestamp: getTimestamp(),
          prompt: prompt.value,
        });

        prompt.value = "";
      }}
    >
      <label for="shell-prompt" class="text-[#DAD4C6]">~dtimer$</label>
      <input
        autofocus
        id="shell-prompt"
        value={prompt}
        onInput={(event) => {
          prompt.value = event.currentTarget.value;
        }}
        // list="available-commands"
        type="text"
        autocomplete="off"
        class="grow bg-[#394253] border-none p-0 focus:ring-0 text-[#FAF7E8]"
      />
      <button type="submit" class="text-[#FEFEF4] px-2" title="Return">
        <ReturnIcon />
      </button>
      <datalist id="available-commands">
        <option>about</option>
        <option>download</option>
        <option>exit</option>
        <option>features</option>
        <option>home</option>
        <option>privacy</option>
        <option>source</option>
      </datalist>
    </form>
  );
}
