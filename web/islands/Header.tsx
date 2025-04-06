import { useSignal } from "@preact/signals";
import ThemeSwitcher from "../islands/ThemeSwitcher.tsx";
import Logo from "../components/icons/logo.tsx";
import ExternalIcon from "../components/icons/external.tsx";
import { docsUrl } from "../config.ts";
import { Release } from "../types.ts";

function NavLink(
  { href, title, external = false, small = false }: {
    href: string;
    title: string;
    external?: boolean;
    small?: boolean;
  },
) {
  return (
    <a
      class={[
        "aria-[current='page']:underline hover:opacity-70 flex gap-1 items-center",
        small ? "text-xs" : "",
      ].join(" ")}
      href={href}
      {...(external && {
        rel: "noopener",
        target: "_blank",
      })}
    >
      {title}
      {external && <ExternalIcon />}
    </a>
  );
}

export default function Header({ latestRelease }: { latestRelease: Release }) {
  const isMenuOpen = useSignal(false);

  return (
    <>
      <div class="flex justify-between w-full">
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
            <NavLink href="/about" title="About" />
            <NavLink
              href={docsUrl}
              title="Docs"
              external
            />
            <NavLink href="/download" title="Download" />
            <NavLink href="/features" title="Features" />
            <NavLink href="/" title="Home" />
            <NavLink href="/privacy" title="Privacy" />
          </nav>
          <button
            title="Toggle menu"
            class="md:hidden"
            type="button"
            onClick={() => {
              isMenuOpen.value = !isMenuOpen.value;
            }}
          >
            menu
          </button>
          <ThemeSwitcher />
        </div>
      </div>
      {isMenuOpen.value && (
        <nav class="mt-4 md:hidden flex-col flex gap-3">
          <NavLink href="/about" title="About" />
          <NavLink
            href={docsUrl}
            title="Docs"
            external
          />
          <NavLink href="/download" title="Download" />
          <NavLink href="/features" title="Features" />
          <NavLink href="/" title="Home" />
          <NavLink href="/privacy" title="Privacy" />
        </nav>
      )}
    </>
  );
}
