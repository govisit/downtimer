import { useSignal } from "@preact/signals";
import ThemeSwitcher from "../islands/ThemeSwitcher.tsx";
import Logo from "../components/icons/logo.tsx";

function NavLink(
  { href, title, external = false }: {
    href: string;
    title: string;
    external?: boolean;
  },
) {
  return (
    <a
      class="aria-[current='page']:underline hover:opacity-70"
      href={href}
      {...(external && {
        rel: "noopener",
        target: "_blank",
      })}
    >
      {title}
    </a>
  );
}

export default function Header() {
  const isMenuOpen = useSignal(false);

  return (
    <>
      <div class="flex justify-between w-full">
        <a href="/" class="font-bold flex items-center gap-2">
          <Logo /> DownTimer
        </a>
        <div class="flex justify-end gap-3 items-center">
          <nav class="hidden md:flex md:flex-row md:gap-3">
            <NavLink href="/about" title="About" />
            <NavLink
              href="https://github.com/mabasic/DownTimer-docs"
              title="Docs"
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
            href="https://github.com/mabasic/DownTimer-docs"
            title="Docs"
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
