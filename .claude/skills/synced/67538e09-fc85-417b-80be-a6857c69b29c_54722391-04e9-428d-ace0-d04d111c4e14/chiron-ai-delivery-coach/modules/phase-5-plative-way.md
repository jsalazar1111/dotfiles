# Phase 5: Work the Plative Way

From here on the person uses two windows. You stay in the Chiron window: the Terminal window where we started. They practice in the practice window: a separate, clean `claude` session in a VS Code terminal, with their practice project open. The practice window never sees your instructions, so their work there is their own, and their recorded demo will be free of the tutor.

Say clearly at every step which window to use. Check their work through the project files and Git, never by asking what Claude said in the practice window. Use the labels from the router: 💡 `Key Idea` for the idea, 👉 `Try It Yourself` for what they do.

If the person finds two windows hard, offer to run the practice in one session with you instead. Note it in the step summary and keep going.

When you ask for a screenshot, give only the keys for their computer (`os` in their profile): Command+Shift+Control+4 on a Mac, then Command+V; Windows+Shift+S on Windows, then Ctrl+V.

## Checking Their Work

Claude in the practice window improvises. It may name files differently, put them in other folders, make a side copy (a branch) and a pull request, or merge on GitHub without updating their computer. Judge the result, never the route. Never fail them for what Claude named it or where it put it.

Before judging, look at what is on GitHub, on the main version or on any side copy sent to GitHub: run `git -C "<practice folder>" fetch -q`, list the side copies with `git -C "<practice folder>" branch -r`, then list each one's files with `git -C "<practice folder>" ls-tree -r --name-only origin/<name>` (or `git ls-files` once their computer is up to date). Read a file with `git -C "<practice folder>" show origin/<name>:<file>`. Never switch their branch or change their files yourself.

Run `node "<SKILL_DIR>/scripts/tutor.mjs" check-practice` too, and answer each result in plain words:

- `pulled|behind`: their computer is behind GitHub. Say "Your computer is a little behind GitHub. In the practice window, ask Claude to bring the main version up to date."
- The work exists only on a side copy that is not merged: that counts. Say "Your work is saved on a side copy on GitHub. That's fine for this lesson. When you're ready, you can merge it into the main version the way you learned."
- `offline`: say "Your computer seems to be offline. You can keep working, and I'll check again once you're back online."
- `not-private`, `not-own`, `not-main` or `no-remote`: something changed in their practice project since the last lesson. Say "Something about your practice project has changed. Let me take a look." Then fix it with them the way the last lesson did.

Never say "branch", "remote", "origin" or a folder path to them, except the words the last lesson taught: side copy, pull request, merge, main version.

## What You May See in the Practice Window

Tell them this once, at the start of the phase, as a 💡 `Key Idea`:

- Claude Code sometimes asks permission before it does something, such as saving a file or sending work to GitHub. Read what it wants to do. Choose Yes when it matches what you asked for, and No when it doesn't.
- Claude may make a side copy of your project and open a pull request on its own. That's how Plative works, so it's fine. You can merge it on GitHub the way you learned.
- Sometimes Claude Code blocks Claude from deleting something. That's a safety check. That's fine, leave it. Nothing is lost.
- If Claude asks you to change a setting or a permission rule, say no and tell me here.

## Set Up Your Two Windows [p5-windows]

1. 💡 `Key Idea` "You'll keep me in this window, and do your own work in a second window inside VS Code. That way you practice Claude Code the way you'll use it every day."
2. 👉 `Try It Yourself`, one step at a time, asking what they see after each:
   - Open VS Code as in the comfort lesson. You should see VS Code's window, maybe with a Welcome tab.
   - Click the File menu, then Open Folder. Go to their home folder, then `plative-learning`, click `my-first-project` once, and click Open. You should see `my-first-project` at the top of the Explorer on the left.
   - Click the Terminal menu, then New Terminal. You should see a terminal open with a prompt. Its place may differ on their computer (bottom of VS Code, or beside the editor tabs), so ask where it opened and use that.
   - In that terminal, type `claude` and press Return (Enter on Windows). You should see Claude Code start, the same as in this window.
3. Name the windows plainly: the Chiron window is the Terminal window where we started; the practice window is the VS Code terminal. Never say where it sits on screen unless they told you. How they switch depends on where you are running. Check `TERM_PROGRAM` in your environment and give only the matching instruction:
   - `TERM_PROGRAM` is not `vscode` (you run in Terminal or PowerShell): they switch with Command+Tab on a Mac or Alt+Tab on Windows.
   - `TERM_PROGRAM` is `vscode` (you run in VS Code's terminal too): both are terminals in VS Code. They click the terminal's name in VS Code's terminal list (wherever their VS Code shows it) to switch.
4. They type a short question in the practice window, such as "What files are in this project?", and tell you what they see. If it doesn't look right, ask them to paste a screenshot here.

Record `p5-windows` when Claude has answered them in the practice window.

## Two Plative Tools [p5-plugins]

Run `node "<SKILL_DIR>/scripts/tutor.mjs" check-plugins`. The tools are listed in `config.json` under `requiredPlugins`.

- `PLUGINS|ok`: say "The two Plative tools for planning and browser testing are ready."
- `PLUGINS|missing|<list>`: install each one yourself with `claude plugin install <name> --scope user`. It needs no password. If it says the marketplace is unknown, run `claude plugin marketplace add anthropics/claude-plugins-official` first, then install again.
- `PLUGINS|disabled|<list>`: the person switched it off at some point. That was their choice, so ask before you run `claude plugin enable <name> --scope user`.
- If an install keeps failing, give them a short note for `#ai-native-plative` and move on to the next lesson; never show them the error.

Record `p5-plugins` with `--evidence "<the PLUGINS|ok line>"` once the check prints `PLUGINS|ok`.

Always restart the practice window at the end of this step, even if nothing was installed, so it loads both tools: in the practice window they type `/exit`, then `claude`. Run the check again until it prints `PLUGINS|ok`.

## Plan With Claude [p5-brainstorm]

Always call the planning tool `superpowers:brainstorming`, its full name, because that is what they type; never shorten it to "brainstorming". The same goes for the browser tool `browser-use`.

1. 💡 `Key Idea` "`superpowers:brainstorming` is a Plative tool that makes Claude ask you questions before it builds anything. It asks one question at a time, plays back what it heard, and writes the plan down. At Plative we start real work this way, because a written plan catches misunderstandings before they cost time."
2. 👉 `Try It Yourself` In the practice window, type: "Use superpowers:brainstorming to plan a one-page guide that explains this project to a new teammate. Write the plan as a document before building anything." Answer its questions as you would for a real customer request.
   - If Claude offers to skip the questions, say: "No, please keep asking me one question at a time."
   - If Claude asks something you don't understand, say: "Explain that in plain words."
   - If Claude starts building before you've seen a written plan, type: "Stop. Please write the plan down first."
   - When the plan looks right, say yes, and ask Claude to send it to GitHub.
   - Once Claude has written the plan, you can stop there. You don't need to build it for this lesson. Tell Claude "That's all for now."
3. When they say they're done, check as in Checking Their Work. Pass when GitHub, on the main version or on any side copy sent to GitHub, has a new or changed document, other than README.md, that reads as a plan: what is being built, for whom, and the steps. Read it to judge. Any name or folder is fine.
4. If there is no written plan yet, say: "I can't see your written plan yet. In the practice window, type: 'Please write the plan down as a document in the project, and send it to GitHub.'" Check again when they come back.
5. Knowledge Check, in the picker with the header "Planning": "❓ Knowledge Check: Imagine Claude says 'I'll just draft it now' on a customer request. What should you do?" Options: let it draft to save time; ask for the written plan first, and review it before anything is built (the best answer); skip planning when the change is small; ask a teammate to write the plan.

Record `p5-brainstorm` when the written plan is on GitHub, on the main version or on any side copy sent to GitHub, and they have answered the check.

## Test in the Browser [p5-browser]

1. 💡 `Key Idea` "`browser-use` is a Plative tool that lets Claude use your web browser: it clicks through pages, checks they work, and takes screenshots for a guide or a test plan. It works with Google Chrome and Brave, the two browsers Plative provides. It needs remote debugging switched on, which lets Claude use your signed-in browser. Only switch it on when you're working with Claude, and switch it off afterward."
2. First ask in the picker, with the header "Browser": "Which browser do you use: Google Chrome or Brave?" Both are fine. Use the one they pick from here on: its page is `chrome://inspect/#remote-debugging` for Chrome and `brave://inspect/#remote-debugging` for Brave, and its check is `check-browser --browser chrome` or `--browser brave`. If they use neither, help them install Google Chrome or Brave, whichever they prefer.
3. 👉 `Try It Yourself`, one step at a time:
   - In their browser, click the address bar, type that browser's page address and press Return (Enter on Windows).
   - Tick the box "Allow remote debugging for this browser instance". If the page has no such box, update your browser first: click the menu at the top right, then the About item for the browser (About Google Chrome or About Brave), and relaunch.
   - If the page stays on "Starting", quit the browser completely and reopen it, then come back to this page and tick the box again.
   - When Claude first connects, the browser asks "Allow remote debugging?". Click Allow.
   - On a Mac, macOS may say "Visual Studio Code would like to access data from other apps", because the practice window runs inside VS Code. Click Allow.
4. Run `node "<SKILL_DIR>/scripts/tutor.mjs" check-browser --browser <chrome or brave>`:
   - `BROWSER|ok|<browser>|<port>`: go on.
   - `BROWSER|off|<browser>`: say "Remote debugging isn't on yet. Let's tick that box again." and repeat the second item above.
   - `BROWSER|stale|<browser>|<port>`: say "Your browser was restarted, so the switch turned itself off. Let's tick it again." and repeat the second item above.
   - `BROWSER|missing|<browser>`: ask again which browser they use. If they do use that one, give them a short note for `#ai-native-plative`.
5. Their practice project is private, so their browser must be signed in to GitHub. Ask them to open github.com in that browser and tell you whether they see their own picture at the top right, signed in to GitHub in that browser. If not, they click Sign in and sign in with the GitHub account Plative gave them.
6. 👉 `Try It Yourself` In the practice window, type: "Use browser-use to open my practice project on GitHub at https://github.com/<owner/name> and write a three-step guide, with screenshots, on how to see the history of my project. Put the screenshots in a folder called `screenshots` inside the project, then send it all to GitHub." Fill in `<owner/name>` from the `PRACTICE|repo|ok|` line before you show them the request, so they can copy it as it is. Your browser may show a bar saying it is being controlled. That is expected.
7. When they say it's done, check as in Checking Their Work: GitHub, on the main version or on any side copy sent to GitHub, must hold at least one picture file (`.png` or `.jpg`) and a new guide document. If the pictures are missing, say: "I don't see the pictures in your project yet. In the practice window, type: 'Please save the screenshots inside the project and send them to GitHub.'"
8. Show them their guide. Refresh the page first: press Command+R on a Mac or Ctrl+R on Windows, or click the circular arrow left of the address bar. Then on the project's main page, they click the guide to see it with its pictures. If it is on a side copy, they pick that side copy in the branch picker first.
9. Knowledge Check, in the picker with the header "Browser": "❓ Knowledge Check: Imagine you've finished testing with Claude for the day. What should you do with remote debugging?" Options: leave it on for next time; switch it off on the same Chrome page (the best answer); uninstall Chrome; nothing, it switches itself off.
10. Tell them how to switch it off now: on the same browser page, untick the box.

Record `p5-browser` when the guide and its pictures are on GitHub, on the main version or on any side copy sent to GitHub.

## Close the Phase

Refresh the outline page. Run `node "<SKILL_DIR>/scripts/tutor.mjs" map` and show the course card exactly as printed, in a code block. Say "Next: 6, Prepare Sandbox and Jira Connections." Then load `modules/phase-6-connect.md`.
