import { getLatestReleaseForHeader } from "../github.ts";
import { define } from "../utils.ts";
import { NavLink } from "../components/menu.tsx";
import { repoUrl } from "../config.ts";
import Header from "../components/header.tsx";

export default define.layout(async ({ Component }) => {
  const latestRelease = await getLatestReleaseForHeader();

  return (
    <div class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 flex flex-col font-mono min-h-screen">
      <Header latestRelease={latestRelease} />
      <main class="mt-10 h-full h-full flex flex-col grow">
        <Component />
      </main>
      <footer class="mt-12 font-sans border-t border-dashed border-gray-300 pt-4 flex flex-col gap-4 sm:flex-row justify-between">
        <div>
          © 2023-{new Date().getFullYear()}{" "}
          <a class="font-bold" href="https://govisit.pro" target="_blank">
            Go Visit
          </a>{" "}
          - All rights reserved.
        </div>
        <nav class="flex flex-col sm:flex-row gap-3">
          <NavLink isExternal href={repoUrl} name="Source code" />
          <NavLink href="/download" name="Download" />
          <NavLink
            href="/docs"
            name="Docs"
          />
          <NavLink href="/privacy" name="Privacy" />
        </nav>
      </footer>
    </div>
  );
});
