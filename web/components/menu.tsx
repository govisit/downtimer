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
      <a
        class="hover:opacity-70"
        {...(isExternal && { target: "_blank" })}
        href={href}
      >
        {name}
        {isExternal && <ExternalIcon />}
      </a>
    </MenuItem>
  );
}

export function Menu({ children }: { children: ComponentChildren }) {
  return (
    <menu class="list-disc list-inside">
      {children}
    </menu>
  );
}

export function NavLink(
  { href, title, external = false, small = false }: {
    href: string;
    title: string;
    external?: boolean;
    small?: boolean;
  },
) {
  return (
    <a
      class={[
        "hover:opacity-70 flex gap-1 items-center",
        small ? "text-xs" : "",
        href === "/" ? "" : "aria-[current]:underline ",
      ].join(" ")}
      href={href}
      {...(external && {
        rel: "noopener",
        target: "_blank",
      })}
    >
      {title}
      {external && <ExternalIcon />}
    </a>
  );
}
