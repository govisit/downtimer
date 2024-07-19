import { useEffect } from "preact/hooks";
import ThemeAuto from "../components/icons/theme-auto.tsx";
import ThemeDark from "../components/icons/theme-dark.tsx";
import ThemeLight from "../components/icons/theme-light.tsx";
import { signal } from "@preact/signals";

enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

const getStoredTheme = (): Theme | null => {
  const theme = localStorage.getItem("theme");

  if (theme === null) {
    return null;
  }

  switch (theme) {
    case Theme.Auto.toString():
      return Theme.Auto;
    case Theme.Dark.toString():
      return Theme.Dark;
    case Theme.Light.toString():
      return Theme.Light;
    default:
      return null;
  }
};

const setStoredTheme = (theme: Theme): void =>
  localStorage.setItem("theme", theme.toString());

const getPreferredTheme = (): Theme => {
  const storedTheme = getStoredTheme();

  if (storedTheme) {
    return storedTheme;
  }

  return Theme.Auto;

  // return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
};

const setTheme = (theme: Theme) => {
  if (
    theme === Theme.Auto &&
    globalThis.window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.setAttribute(
      "class",
      Theme.Dark.toString(),
    );
  } else {
    document.documentElement.setAttribute("class", theme.toString());
  }
};

function ThemeIcon({ theme }: { theme: Theme }) {
  switch (theme) {
    case Theme.Auto:
      return <ThemeAuto />;
    case Theme.Dark:
      return <ThemeDark />;
    case Theme.Light:
      return <ThemeLight />;
    default: {
      const _exhaustiveCheck: never = theme;
      return _exhaustiveCheck;
    }
  }
}

export default function ThemeSwitcher() {
  const currentTheme = signal(getPreferredTheme());

  useEffect(() => {
    function handleChange() {
      const storedTheme = getStoredTheme();

      if (storedTheme !== Theme.Light && storedTheme !== Theme.Dark) {
        const preferredTheme = getPreferredTheme();

        setTheme(preferredTheme);

        currentTheme.value = preferredTheme;
      }
    }

    globalThis.window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleChange);

    return () => {
      globalThis.window.matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleChange);
    };
  }, [setTheme, getStoredTheme, getPreferredTheme]);

  /**
   * auto -> dark -> light -> auto
   */
  function changeTheme() {
    switch (currentTheme.value) {
      case Theme.Auto:
        setTheme(Theme.Dark);
        setStoredTheme(Theme.Dark);
        currentTheme.value = Theme.Dark;
        return;
      case Theme.Dark:
        setTheme(Theme.Light);
        setStoredTheme(Theme.Light);
        currentTheme.value = Theme.Light;
        return;
      case Theme.Light:
        setTheme(Theme.Auto);
        setStoredTheme(Theme.Auto);
        currentTheme.value = Theme.Auto;
        return;
      default: {
        const _exhaustiveCheck: never = currentTheme.value;
        return _exhaustiveCheck;
      }
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          changeTheme();
        }}
      >
        <ThemeIcon theme={currentTheme.value} />
      </button>
    </div>
  );
}
