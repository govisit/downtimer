// This file is here to avoid FOUC.
const getStoredTheme = () => localStorage.getItem("theme");

const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();

  if (storedTheme) {
    return storedTheme;
  }

  return "auto";
};

const setTheme = (theme) => {
  if (
    theme === "auto" &&
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.add(theme);
  }
};

setTheme(getPreferredTheme());
