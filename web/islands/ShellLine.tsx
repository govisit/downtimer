import { ComponentChildren } from "preact";
import { Asset } from "../types.ts";
import { repoUrl } from "../config.ts";
import { Menu, MenuItem, MenuItemLink } from "../components/menu.tsx";
import { Code } from "../components/typography.tsx";

export type Line = {
  timestamp: string;
  prompt: string;
};

type ShellLineProps = {
  line: Line;
  setShellPrompt: (prompt: string) => void;
  clearLines: () => void;
  assets: Asset[];
};

export enum ValidPrompts {
  Hello = "hello",
  GoTo = "goto",
  About = "about",
  Features = "features",
  Download = "download",
  Help = "help",
  Clear = "clear",
  Sofia = "sofia",
  Echo = "echo",
}

type PlainResponseProps = {
  children: ComponentChildren;
  className?: string;
};

enum EchoOutput {
  DevNull = "/dev/null",
  DevStdout = "/dev/stdout",
  DevStderr = "/dev/stderr",
}

function PlainResponse(
  { children, className }: PlainResponseProps,
) {
  return (
    <div
      class={`bg-gray-200 dark:bg-gray-800 rounded-lg px-8 py-5 break-word font-normal text-gray-700 dark:text-gray-300 ${className}`}
    >
      {children}
    </div>
  );
}

function ErrorResponse(
  { prompt, message }: { prompt: string; message?: string },
) {
  return (
    <PlainResponse className="text-red-600 dark:text-red-400 font-bold">
      Error: {message || "command not found"}: {prompt}
    </PlainResponse>
  );
}

function HelloWorldResponse({ name }: { name?: string }) {
  return (
    <PlainResponse className="text-green-600 dark:text-green-400 font-bold">
      Hello, {name || "World"}!
    </PlainResponse>
  );
}

function EchoResponse(
  { output, error = false }: { output: string[]; error?: boolean },
) {
  return (
    <PlainResponse
      className={`${
        error
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400"
      } font-bold`}
    >
      {output.join(" ").replaceAll('"', "")}
    </PlainResponse>
  );
}

function SofiaResponse() {
  return (
    <PlainResponse className="text-green-600 dark:text-green-400 font-bold">
      Bok Sofia, voli te tata puno! ❤️
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
            Displays information about this application.
          </SmallText>
        </li>
        <li>
          clear{" "}
          <SmallText>
            Clears the terminal, but history remains intact. Use keybinding
            ctrl+l to trigger this command (sorry).
          </SmallText>
        </li>
        <li>
          download{" "}
          <SmallText>
            Displays a list of download links.
          </SmallText>
        </li>
        <li>
          echo &lt;output&gt;{" "}
          <SmallText>
            Prints given output to the console. You can pipe the output to:{" "}
            <Code>/dev/null</Code>, <Code>/dev/stdout</Code> or{" "}
            <Code>/dev/stderr</Code>.
          </SmallText>
        </li>
        <li>
          features{" "}
          <SmallText>
            Displays the features of this application.
          </SmallText>
        </li>
        <li>
          goto [page]{" "}
          <SmallText>
            Displays a list of links to which you can navigate to. You can also
            pass the page name as the second parameter to navigate to that page.
          </SmallText>
        </li>
        <li>
          hello [name]{" "}
          <SmallText>
            Displays a hello message.
          </SmallText>
        </li>
        <li>
          help{" "}
          <SmallText>
            Displays this help text.
          </SmallText>
        </li>
      </ul>
      <br />
      <p>
        Angle brackets (&lt;&gt;) mean that the argument is required, and square
        brackets ([]) mean that the argument is optional.
      </p>
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
        <b>Manage multiple timers which count down time.</b>{" "}
        You can download the binary if you type{" "}
        <button
          type="button"
          class="bg-gray-900 dark:bg-gray-100 py px-2 rounded text-gray-100 dark:text-gray-900 hover:opacity-70 cursor-pointer"
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
        DownTimer is a CLI application written in TypeScript / Deno, and
        compiled to a binary. You tell it how much time you want to count down,
        and you can pause it, resume it, view times it has been paused, when it
        completed, etc. It also has a nice CLI display where it uses ASCII
        graphics to show remaining time. Good for showing linux rices or
        actually being productive.
      </p>
      <br />

      <div>
        &gt; dt timer start -n DownTimer -d "2h" -c --font slick<br />
        Name: DownTimer<br />
        Duration: 2h<br />
        Status: Paused<br />
        Created at: 17.12.2023. 21:56:57<br />
        <br />
        <div class="text-[8px] sm:text-xs">
          ╱╭━━━╮╱╱╭╮╱╱╱╱╱╭━━━╮╱╭━━━╮╱╱╱╱╭━━━╮╱╭━━━╮<br />
          ╱┃╭━╮┃╱╭╯┃╱╱╭╮╱┃╭━━╯╱┃╭━╮┃╱╭╮╱┃╭━╮┃╱┃╭━━╯<br />
          ╱┃┃┃┃┃╱╰╮┃╱╱╰╯╱┃╰━━╮╱┃╰━╯┃╱╰╯╱┃┃┃┃┃╱┃╰━━╮<br />
          ╱┃┃┃┃┃╱╱┃┃╱╱╭╮╱╰━━╮┃╱╰━━╮┃╱╭╮╱┃┃┃┃┃╱┃╭━╮┃<br />
          ╱┃╰━╯┃╱╭╯╰╮╱╰╯╱╭━━╯┃╱╭━━╯┃╱╰╯╱┃╰━╯┃╱┃╰━╯┃<br />
          ╱╰━━━╯╱╰━━╯╱╱╱╱╰━━━╯╱╰━━━╯╱╱╱╱╰━━━╯╱╰━━━╯<br />
        </div>
      </div>
      <br />
      <div>
        <Menu>
          <MenuItemLink
            href="/docs/quickstart"
            name="Quickstart"
          />
          <MenuItemLink
            href={repoUrl + "/issues"}
            name="Issues"
            isExternal
          />
          <MenuItemLink
            href={repoUrl + "/discussions"}
            name="Discussions"
            isExternal
          />
          <MenuItemLink href={repoUrl} name="Source code" isExternal />
        </Menu>
      </div>
    </PlainResponse>
  );
}

function DownloadResponse({ assets }: { assets: Asset[] }) {
  return (
    <PlainResponse>
      <ResponseTitle title="Download" />
      <br />
      <p>
        Download the latest version for your operating system:
      </p>
      <br />
      <Menu>
        {assets.map((asset) => (
          <MenuItemLink href={asset.url} name={asset.name} isExternal />
        ))}
      </Menu>
      <br />
      <p>
        Remember to extract the file. We recommend to name the binary file{" "}
        <Code>dt</Code> after extracting it.<br />
        Add binary to PATH and then call it with <Code>dt --help</Code>.
      </p>
    </PlainResponse>
  );
}

function ResponseTitle({ title }: { title: string }) {
  return (
    <h2 class="text-gray-700 dark:text-gray-300">
      <b>{title}</b>
    </h2>
  );
}

function SmallText({ children }: { children: ComponentChildren }) {
  return (
    <span class="text-gray-600 dark:text-gray-400">
      - {children}
    </span>
  );
}

function FeaturesResponse() {
  return (
    <PlainResponse>
      <ResponseTitle title="Features" />
      <br />
      <Menu>
        <MenuItem>
          Multiple timers{" "}
          <SmallText>
            Most apps limit you to just one timer, not this one.
          </SmallText>
        </MenuItem>
        <MenuItem>
          Countdown view{" "}
          <SmallText>
            Uses ASCII fonts to graphically display remaining time. If you spend
            your days in the terminal you will love this feature.
          </SmallText>
        </MenuItem>
        <MenuItem>
          Logs{" "}
          <SmallText>
            Each timer has a log of events that have happened during the
            lifetime of the timer (started, paused, resumed, completed, manual
            completed).
          </SmallText>
        </MenuItem>
        <MenuItem>
          Topics{" "}
          <SmallText>
            Group timers by topic. Useful when having multiple timers for a
            specific topic.
          </SmallText>
        </MenuItem>
        <MenuItem>
          Templates{" "}
          <SmallText>
            If you notice that you create the same timer over and over, you can
            create a template from that timer.
          </SmallText>
        </MenuItem>
        <MenuItem>
          Cross platform{" "}
          <SmallText>
            Works on all major operating systems.
          </SmallText>
        </MenuItem>
        <MenuItem>
          Disasterproof{" "}
          <SmallText>
            It will continue to work even if you close the terminal or if your
            computer battery dies. <b>No more lost time.</b>
          </SmallText>
        </MenuItem>
      </Menu>
    </PlainResponse>
  );
}

type GoToResponseProps = AboutResponseProps;

function GoToResponse({ setShellPrompt }: GoToResponseProps) {
  return (
    <PlainResponse>
      <p>
        Click on the link bellow or type{" "}
        <button
          type="button"
          class="bg-gray-900 dark:bg-gray-100 py px-2 rounded text-gray-100 dark:text-gray-900 hover:opacity-70 cursor-pointer"
          onClick={() => {
            if (setShellPrompt) {
              setShellPrompt("goto home");
            }
          }}
        >
          goto &lt;page&gt;
        </button>{" "}
        in the shell prompt to navigate to that web page.
      </p>
      <br />
      <Menu>
        <MenuItemLink href="/home" name="home" />
        <MenuItemLink href="/docs" name="docs" />
        <MenuItemLink href="/docs/quickstart" name="docs/quickstart" />
        <MenuItemLink href="/privacy" name="privacy" />
      </Menu>
      <br />
      <p class="text-gray-600 dark:text-gray-400">
        <span class="text-red-600 dark:text-red-400">*</span>
        Clicking on the links above or using the <Code>goto</Code>{" "}
        command will reset shell history.
      </p>
    </PlainResponse>
  );
}

export default function ShellLine(
  { line, setShellPrompt, clearLines, assets }: ShellLineProps,
) {
  const response = (() => {
    const [command, ...other] = line.prompt.split(" ");

    switch (command) {
      case ValidPrompts.Hello: {
        const [name] = other;

        return <HelloWorldResponse name={name} />;
      }

      case ValidPrompts.Help: {
        return <HelpResponse />;
      }

      case ValidPrompts.GoTo: {
        const [page] = other;

        if (page) {
          switch (page) {
            case "about": {
              globalThis.window.location.href = "/about";
              return;
            }
            case "download": {
              globalThis.window.location.href = "/download";
              return;
            }
            case "features": {
              globalThis.window.location.href = "/features";
              return;
            }
            case "home": {
              globalThis.window.location.href = "/";
              return;
            }
            case "docs": {
              globalThis.window.location.href = "/docs";
              return;
            }
            case "docs/quickstart": {
              globalThis.window.location.href = "/docs/quickstart";
              return;
            }
            case "privacy": {
              globalThis.window.location.href = "/privacy";
              return;
            }
          }
        }

        return <GoToResponse setShellPrompt={setShellPrompt} />;
      }

      case ValidPrompts.About: {
        return <AboutResponse setShellPrompt={setShellPrompt} />;
      }

      case ValidPrompts.Download: {
        return <DownloadResponse assets={assets} />;
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

      case ValidPrompts.Echo: {
        const isValidCommand = new RegExp(
          /(^((".*"){1}|(\S*){1})(( > ){1}(\S+){1})?$)/,
        );

        const args = other.join(" ").trim();

        const result = isValidCommand.exec(args);

        if (!result || !args.length) {
          return (
            <ErrorResponse
              prompt={line.prompt}
              message="invalid syntax"
            />
          );
        }

        const output = result.at(7)!;

        if (!output) {
          return <EchoResponse output={other} />;
        }

        switch (output) {
          case EchoOutput.DevNull: {
            return;
          }
          case EchoOutput.DevStderr: {
            const withoutRedirect = other.slice(0, -2);

            return <EchoResponse output={withoutRedirect} error />;
          }
          case EchoOutput.DevStdout: {
            const withoutRedirect = other.slice(0, -2);

            return <EchoResponse output={withoutRedirect} />;
          }
          default: {
            return (
              <ErrorResponse
                prompt={line.prompt}
                message="output not supported. Use one of the following: /dev/null, /dev/stdout, /dev/stderr."
              />
            );
          }
        }
      }

      default: {
        return <ErrorResponse prompt={line.prompt} />;
      }
    }
  })();

  return (
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="text-sm pt-1 text-gray-600 dark:text-gray-400">
        {line.timestamp}
      </div>
      <div class="grow flex flex-col gap-4">
        <div class="text-gray-800 dark:text-gray-200 italic break-all font-bold">
          {line.prompt}
        </div>
        {response}
      </div>
    </div>
  );
}
