import { ComponentChildren } from "preact";
import ExternalIcon from "./icons/external.tsx";

export function MenuItem({ children }: { children: ComponentChildren }) {
  return <li>{children}</li>;
}

export function MenuItemLink(
  { name, href, isExternal = false }: {
    name: string;
    href: string;
    isExternal?: boolean;
  },
) {
  return (
    <MenuItem>
      <NavLink
        name={name}
        isExternal={isExternal}
        href={href}
      />
    </MenuItem>
  );
}

export function Menu(
  { children, classPlus }: { children: ComponentChildren; classPlus?: string },
) {
  return (
    <menu class={`list-disc list-inside ${classPlus ?? ""}`}>
      {children}
    </menu>
  );
}

export function NavLink(
  { href, name, isExternal = false, small = false }: {
    href: string;
    name: string;
    isExternal?: boolean;
    small?: boolean;
  },
) {
  return (
    <a
      class={[
        "hover:opacity-70 gap-1 items-center inline-flex shrink-0",
        small ? "text-xs" : "",
        href === "/" ? "" : "aria-[current]:underline ",
      ].join(" ")}
      href={href}
      {...(isExternal && {
        rel: "noopener",
        target: "_blank",
      })}
    >
      {name}
      {isExternal && <ExternalIcon />}
    </a>
  );
}
