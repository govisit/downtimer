# DownTimer

**Manage multiple timers which count down time.**

DownTimer is a CLI application written in TypeScript / Deno, and compiled to a
binary. You tell it how much time you want to count down, and you can pause it,
resume it, view times it has been paused, when it completed, etc. It also has a
nice CLI display where it uses ASCII graphics to show remaining time. Good for
showing linux rices or actually being productive.

```bash
> dt timer start -n DownTimer -d "2h" -c --font slick
Name: DownTimer
Duration: 2h
Status: Paused
Created at: 17.12.2023. 21:56:57

╱╭━━━╮╱╱╭╮╱╱╱╱╱╭━━━╮╱╭━━━╮╱╱╱╱╭━━━╮╱╭━━━╮
╱┃╭━╮┃╱╭╯┃╱╱╭╮╱┃╭━━╯╱┃╭━╮┃╱╭╮╱┃╭━╮┃╱┃╭━━╯
╱┃┃┃┃┃╱╰╮┃╱╱╰╯╱┃╰━━╮╱┃╰━╯┃╱╰╯╱┃┃┃┃┃╱┃╰━━╮
╱┃┃┃┃┃╱╱┃┃╱╱╭╮╱╰━━╮┃╱╰━━╮┃╱╭╮╱┃┃┃┃┃╱┃╭━╮┃
╱┃╰━╯┃╱╭╯╰╮╱╰╯╱╭━━╯┃╱╭━━╯┃╱╰╯╱┃╰━╯┃╱┃╰━╯┃
╱╰━━━╯╱╰━━╯╱╱╱╱╰━━━╯╱╰━━━╯╱╱╱╱╰━━━╯╱╰━━━╯
```

## Documentation

- [Docs index](https://downtimer.govisit.pro/docs)
  - [Quickstart](https://downtimer.govisit.pro/docs/quickstart)
- [Issues](https://github.com/govisit/downtimer/issues)
- [Discussions](https://github.com/govisit/downtimer/discussions)

## Local development

Make sure to install Deno: https://deno.land/manual/getting_started/installation

```bash
deno install

deno task --cwd ./web dev

deno task --cwd ./cli start
```

### Releases

Run the following script with different parameters. It will bump the version in
deno.json and create a commit. It will also tag the commit.

Requirements:

- jujutsu
- nushell

```nu
nu ./scripts/version.nu web minor

nu ./scripts/version.nu cli major

nu ./scripts/version.nu shared patch
```

## Requirements

- Deno
- Nushell

## Structure

This monorepo contains projects:

- [cli](/cli/README.md)
- [web](/web/README.md)
- [shared](/shared/README.md)
