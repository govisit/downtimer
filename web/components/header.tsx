import { signal } from "@preact/signals";
import ThemeSwitcher from "../islands/ThemeSwitcher.tsx";
import Logo from "../components/icons/logo.tsx";
import { Release } from "../types.ts";
import { NavLink } from "../components/menu.tsx";
import { OnMenuOpen, ToggleMenu } from "../islands/Header.tsx";

const isMenuOpen = signal(false);

export default function Header({ latestRelease }: { latestRelease: Release }) {
  return (
    <>
      <header class="flex justify-between w-full">
        <div class="flex gap-2">
          <a href="/" class="font-bold flex items-center gap-2">
            <Logo /> DownTimer
          </a>
          <NavLink
            small
            href={latestRelease.url}
            title={latestRelease.name}
            external
          />
        </div>
        <div class="flex justify-end gap-3 items-center">
          <nav class="hidden md:flex md:flex-row md:gap-3">
            <NavLink href="/" title="Home" />
            <NavLink
              href="/docs"
              title="Docs"
            />
            <NavLink href="/privacy" title="Privacy" />
          </nav>
          <ToggleMenu isMenuOpen={isMenuOpen} />
          <ThemeSwitcher />
        </div>
      </header>
      <OnMenuOpen isMenuOpen={isMenuOpen}>
        <nav class="mt-4 md:hidden flex-col flex gap-3">
          <NavLink href="/" title="Home" />
          <NavLink
            href="/docs"
            title="Docs"
          />
          <NavLink href="/privacy" title="Privacy" />
        </nav>
      </OnMenuOpen>
    </>
  );
}
