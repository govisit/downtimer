import { ComponentChildren } from "https://esm.sh/v128/preact@10.19.6/src/index.js";

export type Line = {
  timestamp: string;
  prompt: string;
};

type ShellLineProps = {
  line: Line;
  setShellPrompt: (prompt: string) => void;
  clearLines: () => void;
};

export enum ValidPrompts {
  Hello = "hello",
  GoTo = "goto",
  About = "about",
  Features = "features",
  Privacy = "privacy",
  Download = "download",
  Help = "help",
  Clear = "clear",
  Sofia = "sofia",
}

type PlainResponseProps = {
  children: ComponentChildren;
  className?: string;
};

function PlainResponse(
  { children, className }: PlainResponseProps,
) {
  return (
    <div
      class={`bg-[#24242E] rounded-lg px-8 py-5 break-word font-normal text-[#FFFFF2] ${className}`}
    >
      {children}
    </div>
  );
}

function ErrorResponse({ prompt }: { prompt: string }) {
  return (
    <PlainResponse className="text-red-500 font-bold">
      Error: command not found: {prompt}
    </PlainResponse>
  );
}

function HelloWorldResponse() {
  return (
    <PlainResponse className="text-green-500 font-bold">
      Hello, World!
    </PlainResponse>
  );
}

function SofiaResponse() {
  return (
    <PlainResponse className="text-green-500 font-bold">
      Bok Sofia, voli te tata! ❤️
    </PlainResponse>
  );
}

function HelpResponse() {
  return (
    <PlainResponse>
      <p>These are the available commands that you can enter in the prompt:</p>
      <br />
      <ul>
        <li>
          about{" "}
          <SmallText>
            it displays information about this application.
          </SmallText>
        </li>
        <li>
          download{" "}
          <SmallText>
            it displays a list of download links.
          </SmallText>
        </li>
        <li>
          features{" "}
          <SmallText>
            it displays the features of this application.
          </SmallText>
        </li>
        <li>
          goto{" "}
          <SmallText>
            it displays a list of links to which you can navigate to.
          </SmallText>
        </li>
        <li>
          hello{" "}
          <SmallText>
            it displays a hello message.
          </SmallText>
        </li>
        <li>
          help{" "}
          <SmallText>
            it displays this help text.
          </SmallText>
        </li>
        <li>
          privacy{" "}
          <SmallText>
            it displays a privacy notice.
          </SmallText>
        </li>
      </ul>
    </PlainResponse>
  );
}

type AboutResponseProps = {
  setShellPrompt?: (prompt: string) => void;
};

function AboutResponse({ setShellPrompt }: AboutResponseProps) {
  return (
    <PlainResponse>
      <ResponseTitle title="About" />
      <br />
      <p>
        I needed a way to manage multiple timers, so I have created this
        application. The CLI application is free to download and use. It has no
        restrictions. You can download the binary if you type{" "}
        <button
          type="button"
          class="bg-white py px-1 rounded text-black"
          onClick={() => {
            if (setShellPrompt) {
              setShellPrompt(ValidPrompts.Download.toString());
            }
          }}
        >
          download
        </button>{" "}
        in the shell prompt bellow.
      </p>
      <br />
      <p>
        In the future I plan to add a web app and implement the sync feature in
        the CLI application so that you can sync your timers across devices.
        These both features will require some form of payment, but the CLI
        application will remain free forever.
      </p>
    </PlainResponse>
  );
}

function DownloadResponse() {
  return (
    <PlainResponse>
      <ResponseTitle title="Download" />
      <br />
      <p>
        Download the binary file for your operating system:
      </p>
      <br />
      <ul class="list-disc list-inside">
        <li>
          <a class="hover:opacity-70" href="/files/dt">Linux</a>
        </li>
        <li>
          <a class="hover:opacity-70" href="/files/dt.exe">Windows</a>
        </li>
        <li>
          <a class="hover:opacity-70" href="/files/dt.dmg">Mac</a>
        </li>
      </ul>
    </PlainResponse>
  );
}

function ResponseTitle({ title }: { title: string }) {
  return (
    <h2 class="text-lg text-violet-500">
      <b>{title}</b>
    </h2>
  );
}

function PrivacyResponse() {
  return (
    <PlainResponse>
      <ResponseTitle title="Privacy Notice" />

      <br />

      <p>
        This notice provides information about the types of information I may
        collect from you when you visit my website and explains how I use such
        data, as well as describes the steps I take in order to protect them.
        The notice also describes the options you have with regard to the
        collection and use of your data when you visit my website.
      </p>

      <br />

      <p>
        <h3>Analytics</h3>
        I use a self-hosted version of{" "}
        <a
          class="underline hover:opacity-70"
          href="https://plausible.io"
          rel="nofollow noopener"
          target="_blank"
        >
          Plausible Analytics
        </a>{" "}
        for the purpose of collecting and analyzing website visit frequency. It
        is an open source web analytics software, built in the EU, with no
        cookies, no tracking and no personal data collection.
      </p>

      <br />

      <p>
        <h3>Cookies</h3> This website does not use cookies.
      </p>
    </PlainResponse>
  );
}

function SmallText({ children }: { children: ComponentChildren }) {
  return (
    <span class="text-sm">
      - {children}
    </span>
  );
}

function FeaturesResponse() {
  return (
    <PlainResponse>
      <ResponseTitle title="Features" />
      <br />
      <ul class="list-disc list-inside">
        <li>
          Multiple timers{" "}
          <SmallText>
            Most apps limit you to just one timer, not this one.
          </SmallText>
        </li>
        <li>
          Countdown view{" "}
          <SmallText>
            If you spend your days in the terminal you will love this feature.
          </SmallText>
        </li>
        <li>
          Logs{" "}
          <SmallText>
            each timer has a log of events that have happened during the
            lifetime of the timer (started, paused, resumed, completed, manual
            completed).
          </SmallText>
        </li>
        <li>
          Topics{" "}
          <SmallText>
            group timers by topic. Useful when having multiple timers for a
            specific topic.
          </SmallText>
        </li>
        <li>
          Templates{" "}
          <SmallText>
            if you notice that you reuse the same timer multiple times, you can
            create a template from that timer.
          </SmallText>
        </li>
        <li>
          Cross platform{" "}
          <SmallText>
            works on all major operating systems.
          </SmallText>
        </li>
        <li>
          Disasterproof{" "}
          <SmallText>
            it will continue to work even if you close the terminal or if your
            computer battery dies. <b>No more lost time.</b>
          </SmallText>
        </li>
      </ul>
    </PlainResponse>
  );
}

function GoToResponse() {
  return (
    <PlainResponse>
      <p>Click on the link bellow to navigate to that web page.</p>
      <br />
      <ul class="list-disc list-inside">
        <li>
          <a class="hover:opacity-70" href="/about">About</a>
        </li>
        <li>
          <a class="hover:opacity-70" href="/download">Download</a>
        </li>
        <li>
          <a class="hover:opacity-70" href="/features">Features</a>
        </li>
        <li>
          <a class="hover:opacity-70" href="/">Home</a>
        </li>
        <li>
          <a class="hover:opacity-70" href="/privacy">Privacy</a>
        </li>
      </ul>
      <br />
      <p class="text-sm">
        <span class="text-red-500">*</span>
        Clicking on the links above will reset shell history.
      </p>
    </PlainResponse>
  );
}

export default function ShellLine(
  { line, setShellPrompt, clearLines }: ShellLineProps,
) {
  const response = (() => {
    switch (line.prompt) {
      case ValidPrompts.Hello: {
        return <HelloWorldResponse />;
      }

      case ValidPrompts.Help: {
        return <HelpResponse />;
      }

      case ValidPrompts.GoTo: {
        return <GoToResponse />;
      }

      case ValidPrompts.About: {
        return <AboutResponse setShellPrompt={setShellPrompt} />;
      }

      case ValidPrompts.Download: {
        return <DownloadResponse />;
      }

      case ValidPrompts.Privacy: {
        return <PrivacyResponse />;
      }

      case ValidPrompts.Features: {
        return <FeaturesResponse />;
      }

      case ValidPrompts.Clear: {
        clearLines();
        return;
      }

      case ValidPrompts.Sofia: {
        return <SofiaResponse />;
      }

      default: {
        return <ErrorResponse prompt={line.prompt} />;
      }
    }
  })();

  return (
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="text-sm text-[#D5CFC3] leading-6">{line.timestamp}</div>
      <div class="grow flex flex-col gap-4">
        <div class="text-[#FFFFF2] italic break-word font-bold">
          {line.prompt}
        </div>
        {response}
      </div>
    </div>
  );
}
