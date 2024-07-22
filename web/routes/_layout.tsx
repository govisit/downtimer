import { PageProps } from "$fresh/server.ts";
import { ComponentChildren } from "https://esm.sh/v128/preact@10.19.6/src/index.js";
import Header from "../islands/Header.tsx";

export default function Layout({ Component }: PageProps) {
  return (
    <LayoutComponent>
      <Component />
    </LayoutComponent>
  );
}

export function LayoutComponent({ children, isScreen = true }: {
  isScreen?: boolean;
  children: ComponentChildren;
}) {
  return (
    <div
      class={[
        "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 flex flex-col font-mono",
        isScreen ? "h-screen" : "",
      ].join(" ")}
    >
      <Header />
      <div
        class={["mt-10 h-full h-full", isScreen ? "overflow-hidden" : ""].join(
          " ",
        )}
      >
        {children}
      </div>
    </div>
  );
}
