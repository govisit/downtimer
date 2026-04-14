The best way to learn how to use DownTimer is to just try some commands and take
it from there. It is very resiliant and you can't do much wrong.

```bash
# 1. Start a timer
dt timer start --name "Timer name" --duration "1m"
# Timer "01J3GD5Q255KEJXCCDFS8BYXHW" started.

# 2. Show timer countdown
dt timer show 01J3GD5Q255KEJXCCDFS8BYXHW --countdown
# Name: Timer name
# Duration: 1m
# Status: Started
# Created at: 23.07.2024. 20:22:19
#
#
#  ╔═╗ ╔═╗   ╔═╗ ╔═╗   ╔═╗ ╔═╗
#  ║═║ ║═║ o ║═║ ║═║ o  ╠║ ╚═╣
#  ╚═╝ ╚═╝ o ╚═╝ ╚═╝ o ╚═╝ ╚═╝
#
```

You can pause/resume the timer by pressing the `<space>` key on the keyboard.

The terminal will ring a bell once the timer completes.

At any point in time you can view the logs of a specific timer:

```bash
dt timer show 01J3GD5Q255KEJXCCDFS8BYXHW --logs

# Name          Timer name          
# Duration      1m                  
# Status        Completed           
# Created at    23.07.2024. 20:22:19
# Completed at  23.07.2024. 20:25:40
#
# Logs:
# ┌───────────┬──────────────────────┐
# │ Status    │ Timestamp            │
# ├───────────┼──────────────────────┤
# │ Started   │ 23.07.2024. 20:22:19 │
# ├───────────┼──────────────────────┤
# │ Paused    │ 23.07.2024. 20:22:40 │
# ├───────────┼──────────────────────┤
# │ Resumed   │ 23.07.2024. 20:25:02 │
# ├───────────┼──────────────────────┤
# │ Completed │ 23.07.2024. 20:25:40 │
# └───────────┴──────────────────────┘
```

Since you are probably going to reuse the same timer over and over again it is
best that you create a template from a timer. Then, you can use a "shortcut" to
start a timer from a template directly in countdown mode.

```bash
# 3. Create a template from a timer
dt template create:timer 01J3GD5Q255KEJXCCDFS8BYXHW
# Template "Timer name" created.

# 4. Start a timer from a template in countdown mode
dt timer start:template --countdown
# ? Choose a template
# ❯ Timer name 
# Name: Timer name
# Duration: 1m
# Status: Paused
# Created at: 23.07.2024. 20:44:01
#
#
#  ╔═╗ ╔═╗   ╔═╗ ╔═╗   ╔═  ╔═╗
#  ║═║ ║═║ o ║═║ ║═║ o ╚═╗ ╠═╣
#  ╚═╝ ╚═╝ o ╚═╝ ╚═╝ o ══╝ ╚═╝
```

You can override the timer options when creating a template from a timer with
`template create:timer` by passing the same options you would when starting a
timer.

Every command comes with `--help`.
