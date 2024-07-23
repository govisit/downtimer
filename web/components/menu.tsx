import { ComponentChildren } from "preact";

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
