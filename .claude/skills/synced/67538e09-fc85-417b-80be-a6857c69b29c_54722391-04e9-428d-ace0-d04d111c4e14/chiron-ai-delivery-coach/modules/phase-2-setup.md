# Phase 2: Environment Setup

This phase runs in Claude Code. Work through the steps in order. After each step, record it with `node "<SKILL_DIR>/scripts/tutor.mjs" step <stepId> complete "<summary>"`, using the step id in brackets, then save and refresh the page as the router says. `<SKILL_DIR>` is the skill's base directory, and every `scripts/` path below sits under it. Use full paths with the person's home folder written out. All values come from `config.json`: never type a Drive ID from memory.

On a laptop without Node.js, follow the router's early path: the same steps, recorded once Node.js is installed.

## Before Step 1: Model and Effort

You know which model you are running on. Read `effortLevel` from the person's `~/.claude/settings.json` (`%USERPROFILE%\.claude\settings.json` on Windows). If it is Sonnet at low effort, say nothing and go on. Otherwise ask them once to type `/model` and choose Sonnet, then `/effort low`, and say why: it keeps their usage allowance for the work that needs it. If they chose another setting on purpose, mention it once and go on.

## 1. Course Outline

Run `node "<SKILL_DIR>/scripts/tutor.mjs" outline` to write the course outline page, then open it in the person's browser. On Windows, say first: "Windows may ask which app opens the page. Pick Microsoft Edge or Google Chrome and click Always." If they see code instead of a page, give them the full path to open in their browser. Say that you will keep the page current as they progress.

## 2. First-Start Notice [p2-notice]

Show this line exactly as written in `config.json` under `notice`:

> Plative records progress so leaders can follow and support you in your agentic learning journey.

Show it as plain text with no icon or emoji before it. There is no consent gate. Do not ask for permission and do not describe how progress is kept.

Then, if you do not already know their platform (Chiron never asks this in claude.ai), ask one question: "Do you work in Salesforce, NetSuite or both?" Someone who says both starts with one and is offered the other later. Do not ask whether they use a Mac or Windows. Tell them what you see instead, for example "I can see you're on a Mac." Use both answers for `init`.

## 3. Sign-In Check [p2-signin]

Run `sh "<SKILL_DIR>/scripts/check-signin.sh"` on a Mac or `powershell -NoProfile -ExecutionPolicy Bypass -File "<SKILL_DIR>\scripts\check-signin.ps1"` on Windows. Read the one `SIGNIN|` line.

- `SIGNIN|ok|<email>`: record the step and keep the email.
- `not-logged-in`: tell them to run `claude auth login` and sign in with their Plative account.
- `not-subscription`: they used an API key. Ask them to sign out and sign in with their Claude subscription.
- `wrong-org`: they are in another organization. Ask them to sign in with their Plative account.
- `bad-email`: the email is not a Plative address. Ask them to use their Plative email.
- `unexpected-fields` or `unreadable`: stop. Say you cannot confirm the sign-in, never guess, and send them to `#ai-native-plative`.

Stop the course until this passes.

On the first start, once the sign-in passes and Node.js is available, create the local progress folder with `node "<SKILL_DIR>/scripts/tutor.mjs" init --platforms salesforce,netsuite --os mac --email <email> --org Plative`. Use the platforms from Phase 1 and `mac` or `windows`. Then record `p1-start` and `p2-notice` as complete, followed by `node "<SKILL_DIR>/scripts/tutor.mjs" step p2-signin complete "signed in" --evidence "<the SIGNIN|ok line>"`.

## 4. Toolchain Check [p2-toolchain]

Run `sh "<SKILL_DIR>/scripts/check-toolchain.sh"` on a Mac or `powershell -NoProfile -ExecutionPolicy Bypass -File "<SKILL_DIR>\scripts\check-toolchain.ps1"` on Windows. Read the `TOOL|` lines and the final `TOOLCHAIN|` line. VS Code, Python, Node.js, Git, GitHub CLI, SF CLI, SuiteCloud SDF CLI, JDK, jq and uv must all be present and run. Homebrew must be present on a Mac.

If everything is present, record `p2-toolchain` with `--evidence "<the TOOLCHAIN|ok line>"` and skip the Drive and installer steps. If this follows the installer, say "All your tools are installed." Record `p2-drive` and `p2-installer` as complete too, with the summary "not needed".

After the installer, ask them once to close Claude Code and start it again, then run `/chiron-ai-delivery-coach`. This loads the new tools, and on Windows it clears the Git Bash message. Then run the check again.

If tools still show as missing, run the check once more. If they are still missing, never guess why, and never send them off to restart again. Show them which tools are missing and the installer's `RESULT:` lines from its log. Give them a short note to post in `#ai-native-plative`: their computer, the `TOOL|...|missing` lines and those `RESULT:` lines. Then stop and wait.

## 5. Google Drive Access [p2-drive]

Only if something is missing. Check that the Google Drive tools from the person's claude.ai connectors are available. If they are not, guide the person to connect Google Drive in their claude.ai settings. The tools may only appear after they restart Claude Code. Wait for them to come back.

## 6. Installer [p2-installer]

Only if something is missing. Work in one folder: `~/plative-installer` on a Mac, `%USERPROFILE%\plative-installer` on Windows. Create it if needed.

1. Download the zip for their computer with the Google Drive download tool, by its fixed file ID from `config.json` (`driveFiles.mac.id` or `driveFiles.win.id`). Note its name and size from Drive's metadata.
2. The tool returns the file as base64 text, not as a file, and the reply is large (about 126,000 characters), so it is saved to a file. Never paste that text into a command: Windows stops a command line at 32,767 characters. Decode the saved file with `sh "<SKILL_DIR>/scripts/decode-b64.sh" <saved-reply> <zip>` on a Mac or `powershell -NoProfile -ExecutionPolicy Bypass -File "<SKILL_DIR>\scripts\decode-b64.ps1" <saved-reply> <zip>` on Windows, naming the zip after Drive's file name in the installer folder. Read the `DECODE|` line.
3. Check that the decoded file's size matches Drive's size. If it does not, say "The download didn't come through cleanly. I'll try once more." and download it again.
4. Only if that fails, try the folder in `driveFolderId`, then ask the person to download the zip in their browser and look for it in Downloads.

Unpack it into the same folder with `sh "<SKILL_DIR>/scripts/unpack-installer.sh" <zip> <destDir>` on a Mac or `powershell -NoProfile -ExecutionPolicy Bypass -File "<SKILL_DIR>\scripts\unpack-installer.ps1" <zip> <destDir>` on Windows. Read the `RUNNER|` line. It never runs the installer. The runner checks every file against the package's `SHA256SUMS` list before it installs anything. If it reports a mismatch, treat it as a download that did not come through cleanly.

When the size and the files check out, tell the person only: "The installer is downloaded and checked. Next, I'll get it ready to run."

Before you start the installer, show this heads-up exactly as drawn, inside a code block so the border keeps its shape. Do not reword it or shorten it:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ I'm about to install Plative's full AI toolset on this       ┃
┃ computer. It takes about 15 minutes, so please be patient    ┃
┃ and don't close this window, put the computer to sleep or    ┃
┃ press anything while it runs. Stay close: your computer will ┃
┃ ask you to approve it, and you may need to sign in to a      ┃
┃ service or two along the way. I'll tell you what is          ┃
┃ happening as it goes.                                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

Then wait for them to say they are ready. Do not ask unrelated questions while it runs: give a short status line when a tool finishes, and ask for their help only when a prompt needs them.

Then run the installer behind the system's own approval prompt. Say first: "A system prompt is about to appear. Approve it. If you don't see it, check the Dock or the taskbar."

- Mac: run `osascript -e 'do shell script "/bin/sh \"<path>/run-all.sh\" > \"<home>/plative-installer/run.log\" 2>&1" with administrator privileges'`, with the full paths filled in. Apple's dialog asks for their password. You never see it.
- Windows: run `powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','<path>\run-all.ps1'"`. It works from PowerShell or Git Bash. Windows asks them to click Yes.
- The call would block for about 15 minutes, longer than a tool call may wait. Run the command in the background, then read the logs every minute or so until `inventory.log` ends with a `RESULT:` line written after you started.
- While it runs, read the logs (`/Library/Logs/Plative/` on a Mac, `C:\ProgramData\Plative\Logs\` on Windows) and tell them which tool is installing.

When the installer finishes, check every part of it before you say anything about the result. Read the last `RESULT:` line of every log: on a Mac `grep -h "RESULT:" /Library/Logs/Plative/*.log`; on Windows `Select-String -Path "C:\ProgramData\Plative\Logs\*.log" -Pattern 'RESULT:'`. Also read `inventory.log`: it lists anything still missing. Any line that says `FAILED`, or any item reported missing, means a part did not install. Never say the install finished while one of them is open, and never judge it from the last log alone.
- If a tool did not install, the toolchain check below will say so. Repeat the installer once, then follow the rule for a problem you cannot resolve.
- If only the person's own settings and status line did not install (the `peruser-tools` log), say so in plain words: "Everything you need is installed. One extra piece, your settings and status line, did not install. I've noted it for the team." Give them a short note for `#ai-native-plative` that names the log and its `FAILED` line. This does not block the course: go on once the toolchain check passes.

Once the toolchain check passes and, on a first start, the progress folder exists, tell them to restart, because new tools load only in a new Claude Code window: "Close this Claude Code window completely (type `/exit`, or close the window). Open Terminal on a Mac, or PowerShell on Windows, then type `claude`, then type `/chiron-ai-delivery-coach`, and I'll pick up right here." No folder step is needed.

If the prompt is declined or never appears, or the command is blocked, give them the line to run themselves:

- Mac: in a new Terminal window, `sudo sh "<path>/run-all.sh"`. They type their own password.
- Windows: they open a separate administrator PowerShell and paste `powershell -ExecutionPolicy Bypass -File "<path>\run-all.ps1"`. They do not restart Claude Code as an administrator.

A person who is not an administrator uses an administrator account or asks Plative IT. Repeat the toolchain check until it prints `TOOLCHAIN|ok`.

## 7. GitHub [p2-github]

Say first: "You'll approve GitHub once." Then ask them to type `! gh auth login`, with the `!`. Tell them what happens: it shows a code and a web address. They open the address, enter the code, approve with the GitHub account Plative gave them, and come back. Any GitHub account is accepted. If Windows says `gh` is not recognized (the window predates the install), have them type `! & "C:\Program Files\GitHub CLI\gh.exe" auth login` instead. It may say the command moved to the background. That is normal, and you will know when they finish.

Once it finishes, run `gh auth setup-git` yourself, so Git uses the same sign-in and never asks again. If a second "Connect to GitHub" window appears anyway, tell them to approve it and note it for `#ai-native-plative`.

## 8. First Save [p2-save]

The person's progress is kept in a private repo named in `config.json` under `workspaceRepo`, in the person's own GitHub account. Never create it in the Plative organization.

Run `node "<SKILL_DIR>/scripts/tutor.mjs" publish` yourself, only after the progress folder exists (`init`). Only if Claude Code blocks it, run `node "<SKILL_DIR>/scripts/tutor.mjs" publish-line`. It prints `LINE|<line>|copied` and puts the line on their clipboard. Then say: "Type `!`, paste with Cmd+V or Ctrl+V, and press Return. This saves your progress so you can pick up on any computer." If it printed `not-copied`, show them the line to type after the `!`.

Read the `PUBLISH|` line:

- `ok`: say "Your progress is saved. You can stop anytime and pick up later, on any computer." Record `p2-github`, and `p2-save` with `--evidence "<the PUBLISH|ok line>"`, then save and refresh the page.
- `restored`: they worked on another computer before. Say "Welcome back! I found where you left off. First, a quick check that this computer is ready." Run `state`: it points at the sign-in check, because setup belongs to each computer. Do the sign-in check, the toolchain check, and the Drive and installer steps if anything is missing, then continue from where they left off. Then run `outline` and open the outline page again: the page in their browser lost its file for a moment while their saved progress came down, and it does not recover on its own.
- `not-private`, `create-failed`, `clone-failed` or `push-failed`: use the router's message for a save that did not work, and send a short note to `#ai-native-plative` with the `PUBLISH|` line.

When every Phase 2 step is complete, say "Your computer is all set up. Next: getting comfortable with Claude Code."
