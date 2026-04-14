import { ComponentChildren } from "preact";

export function Code({ children }: { children: ComponentChildren }) {
  return <code class="text-sky-600">{children}</code>;
}

export function PageTitle({ children }: { children: ComponentChildren }) {
  return <h1 class="font-pixel text-4xl md:text-5xl mb-8">{children}</h1>;
}
