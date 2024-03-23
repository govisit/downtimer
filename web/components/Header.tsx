export default function Header() {
  return (
    <div class="flex justify-between w-full md:flex-row-reverse flex-col-reverse lg:flex-row">
      <div class="flex gap-3">
        <a
          class="aria-[current='page']:underline hover:opacity-70"
          href="/about"
        >
          About
        </a>
        <a
          class="aria-[current='page']:underline hover:opacity-70"
          href="/download"
        >
          Download
        </a>
        <a
          class="aria-[current='page']:underline hover:opacity-70"
          href="/features"
        >
          Features
        </a>
        <a class="aria-[current='page']:underline hover:opacity-70" href="/">
          Home
        </a>
        <a
          class="aria-[current='page']:underline hover:opacity-70"
          href="/privacy"
        >
          Privacy
        </a>
      </div>
      <div class="font-bold">dtimer</div>
      <div class="hidden lg:block">
        When your phone or PC timer is not enough.
      </div>
    </div>
  );
}
