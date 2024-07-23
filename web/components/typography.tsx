import { ComponentChildren } from "preact";

export function Code({ children }: { children: ComponentChildren }) {
  return <code class="text-sky-600">{children}</code>;
}
