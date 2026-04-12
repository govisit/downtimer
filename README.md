# DownTimer

**When your phone or PC is not enough.**

I needed a way to manage multiple timers which count down time, so I have
created this application. You can download the binary if you type

in the shell prompt bellow.

DownTimer is a CLI application written in TypeScript / Deno, and compiled to a
binary. You tell it how much time you want to count down, and you can pause it,
resume it, view times it has been paused, when it completed, etc. It also has a
nice CLI display where it uses ASCII graphics to show remaining time. Good for
showing linux rices or just showing off your terminal skills.

```bash
> dt timer show 01K7HTNR83EQEG0Q4XXHBDR8G5 -c --font slick
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

- [Docs index](https://github.com/govisit/DownTimer-docs)
- [Quickstart](https://github.com/govisit/DownTimer-docs/wiki/Quickstart)

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
