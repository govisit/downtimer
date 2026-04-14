import { Head } from "fresh/runtime";

export default function PageNotFound() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="px-4 py-8 h-full w-full bg-[#86efac] grow flex items-center rounded-lg dark:text-black">
        <div class="h-full w-full mx-auto flex flex-col items-center justify-center">
          <img
            class="my-6"
            src="/favicon.svg"
            width="128"
            height="128"
            alt="the DownTimer logo: a timer"
          />
          <h1 class="text-center text-4xl font-bold">404 - Page not found</h1>
          <p class="my-4 text-center">
            The page you were looking for doesn't exist.
          </p>
          <a href="/" class="underline">Go back home</a>
        </div>
      </div>
    </>
  );
}
