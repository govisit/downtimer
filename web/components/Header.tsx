export default function Header() {
  return (
    <div class="flex justify-between w-full md:flex-row-reverse flex-col-reverse lg:flex-row">
      <div class="flex gap-3">
        <a class="hover:opacity-70" href="/about">About</a>
        <a class="hover:opacity-70" href="/download">Download</a>
        <a class="hover:opacity-70" href="/features">Features</a>
        <a class="hover:opacity-70" href="/">Home</a>
        <a class="hover:opacity-70" href="/privacy">Privacy</a>
      </div>
      <h1 class="font-bold">dtimer</h1>
      <div class="hidden lg:block">
        When your phone or PC timer is not enough.
      </div>
    </div>
  );
}
