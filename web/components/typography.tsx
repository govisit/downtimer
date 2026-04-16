import { ComponentChildren, HTMLAttributes } from "preact";
import { Schema } from "effect";
import { ElementType } from "preact/compat";

export function Code({ children }: { children: ComponentChildren }) {
  return (
    <code class="text-sky-600 dark:bg-gray-700 bg-gray-300 rounded-lg p-1 text-sm">
      {children}
    </code>
  );
}

export function PageTitle({ children }: { children: ComponentChildren }) {
  return <h1 class="font-pixel text-4xl md:text-5xl mb-8">{children}</h1>;
}

const ValidHeading = Schema.TemplateLiteral(
  "h",
  Schema.Number,
  // NOTE: For some reason this does not work as I expect it to.
  // Schema.Number.pipe(Schema.int(), Schema.between(1, 6)),
);
type ValidHeading = typeof ValidHeading.Type;

export function PageHeading(
  { children, level }: { children: ComponentChildren; level: ValidHeading },
) {
  const HeadingTag = level as unknown as ElementType<
    HTMLAttributes<HTMLHeadingElement>
  >;

  return <HeadingTag class="text-2xl font-pixel mb-2">{children}</HeadingTag>;
}
