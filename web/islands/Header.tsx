import { Signal } from "@preact/signals";
import { ComponentChildren } from "preact";

export function OnMenuOpen(
  { isMenuOpen, children }: {
    isMenuOpen: Signal<boolean>;
    children: ComponentChildren;
  },
) {
  if (isMenuOpen.value === false) {
    return;
  }

  return children;
}

export function ToggleMenu({ isMenuOpen }: { isMenuOpen: Signal<boolean> }) {
  return (
    <button
      title="Toggle menu"
      class="md:hidden cursor-pointer"
      type="button"
      onClick={() => {
        isMenuOpen.value = !isMenuOpen.value;
      }}
    >
      menu
    </button>
  );
}
