# DTimer

When your phone or PC is not enough.

## Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

## Structure

This repository contains two projects:

- cli
- web/api

## Testing

Navigate to a project and run tests with:

```bash
deno task test

# or watch for changes
deno task test --watch
```

### Coverage

Run right after running tests with the above command:

```bash
deno task coverage
```

## Compile

```bash
deno compile --unstable-kv --allow-sys --allow-read --allow-env --allow-write --allow-net --target="x86_64-pc-windows-msvc" main.ts
```

Does not work on Windows ATM. Deno has panicked.
