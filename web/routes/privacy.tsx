import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { PageTitle } from "../components/typography.tsx";

export default define.page(function PrivacyNotice() {
  return (
    <>
      <Head>
        <title>DownTimer - Privacy Notice</title>
      </Head>
      <PageTitle>Privacy Notice</PageTitle>
      <div class="font-sans">
        <p>
          This notice provides information about the types of information I may
          collect from you when you visit my website and explains how I use such
          data, as well as describes the steps I take in order to protect them.
          The notice also describes the options you have with regard to the
          collection and use of your data when you visit my website.
        </p>

        <br />

        <h2 class="text-2xl font-pixel mb-2">Analytics</h2>
        <p>
          I use a self-hosted version of{" "}
          <a
            class="underline hover:opacity-70"
            href="https://plausible.io"
            rel="nofollow noopener"
            target="_blank"
          >
            Plausible Analytics
          </a>{" "}
          for the purpose of collecting and analyzing website visit frequency.
          It is an open source web analytics software, built in the EU, with no
          cookies, no tracking and no personal data collection.
        </p>

        <br />

        <h2 class="text-2xl font-pixel mb-2">Cookies</h2>{" "}
        This website does not use cookies.
      </div>
    </>
  );
});
