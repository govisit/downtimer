import { ComponentChildren } from "preact";
import Header from "../islands/Header.tsx";
import { getLatestReleaseForHeader } from "../github.ts";
import { Release } from "../types.ts";
import { define } from "../utils.ts";

export default define.layout(async (ctx) => {
  const latestRelease = await getLatestReleaseForHeader();

  return (
    <LayoutComponent latestRelease={latestRelease}>
      <ctx.Component />
    </LayoutComponent>
  );
});

export function LayoutComponent({ children, isScreen = true, latestRelease }: {
  isScreen?: boolean;
  children: ComponentChildren;
  latestRelease: Release;
}) {
  return (
    <div
      class={[
        "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 flex flex-col font-mono",
        isScreen ? "h-screen" : "",
      ].join(" ")}
    >
      <Header latestRelease={latestRelease} />
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
