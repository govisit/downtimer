# DownTimer

When your phone or PC is not enough.

## Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

> Do not use workspace because ink react is not compatible with fresh preact.

## Structure

This repository contains two projects:

- cli
- web

### Web

Do not use `"vendor": true` in `deno.json` because build fails then.

## Testing

Navigate to a project and run tests with:

```bash
deno task test

# or watch for changes
deno task test --watch

# or run specific test
deno task test --filter "it should calculate correct completed at time"
```

### Coverage

Run right after running tests with the above command:

```bash
deno task coverage
```

## Compile

```bash
deno task compile:host
deno task compile:windows # For generating Windows executable.
deno task compile:linux # For generating Linux executable.
deno task compile:mac # For generating Mac executable.
deno task compile:mac-arm # For generating Mac ARM executable.
```

Cross compilation (Linux -> Windows) does not work at the moment. The workaround
is to clone the repository to Windows and then run `deno task compile-host`.

Related links:

- https://github.com/denoland/deno/issues/22690
- https://github.com/denoland/deno/discussions/22685
- https://github.com/govisit/deno-cross-compilation-panic

## Deployment/release

I'm using github actions to trigger a new release on tag. Currently the tag
format is `v0.1.0-cli`.

This runs a workflow in which deno is installed, and the cli program is compiled
for each operating system and placed in `/cli/dist` directory. Then I execute
`tar` on each generated binary file to reduce its size. After that, I use
`gh release create` (GitHub CLI) to publish a new release with the newly created
tarred binary files. Finally, I use an
[repository secret for GitHub actions](https://github.com/govisit/DownTimer/settings/secrets/actions)
named `DOCS_GITHUB_TOKEN`, which I generated on this page
[Fine-grained personal access tokens](https://github.com/settings/tokens?type=beta)
for repository `govisit/DownTimer-docs` only; to publish the release on
`govisit/DownTimer-docs` which is publically available.
