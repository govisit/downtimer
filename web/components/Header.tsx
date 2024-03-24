function NavLink({ href, title }: { href: string; title: string }) {
  return (
    <a
      class="aria-[current='page']:underline hover:opacity-70"
      href={href}
    >
      {title}
    </a>
  );
}

export default function Header() {
  return (
    <div class="flex justify-between w-full md:flex-row-reverse flex-col-reverse lg:flex-row">
      <nav class="flex gap-3">
        <NavLink href="/about" title="About" />
        <NavLink href="/download" title="Download" />
        <NavLink href="/features" title="Features" />
        <NavLink href="/" title="Home" />
        <NavLink href="/privacy" title="Privacy" />
      </nav>
      <div class="font-bold">dtimer</div>
      <div class="hidden lg:block">
        When your phone or PC timer is not enough.
      </div>
    </div>
  );
}
