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
deno task compile-host
deno task compile-windows # For generating Windows executable.
deno task compile-linux # For generating Linux executable.
```

Cross compilation (Linux -> Windows) does not work at the moment. The workaround is to clone the repository to Windows and then run `deno task compile-host`.

Related links:
- https://github.com/denoland/deno/issues/22690
- https://github.com/denoland/deno/discussions/22685
- https://github.com/govisit/deno-cross-compilation-panic

