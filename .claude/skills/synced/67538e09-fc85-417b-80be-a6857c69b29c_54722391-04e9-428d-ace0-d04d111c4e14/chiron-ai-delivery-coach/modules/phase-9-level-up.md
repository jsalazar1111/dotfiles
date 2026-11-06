# Phase 9: Level Up With Advanced Claude Code Tips

This phase sits below the line on the course outline: it is optional and never holds up the foundational certification, which ends with the demo. Offer it after the demo, and anytime the person asks. Seven habits that help the person work longer and cleaner. Teach each one with a short exercise in the practice window, then one ❓ `Knowledge Check` in the picker. With every lesson, say its "Why people love it" line in your own words: the benefit people feel, not the feature. Use the labels from the router: 💡 `Key Idea`, 👉 `Try It Yourself`, ❓ `Knowledge Check`.

## Read the Status Line [p9-statusline]

Why people love it: one glance tells you how much room is left, which model you are on, how much allowance remains and whether your work is saved, so you tidy up before quality drops instead of after.

You cannot see another window's status line, so read the script that draws it, and preview it for their practice folder.

1. Run `node "<SKILL_DIR>/scripts/tutor.mjs" check-statusline`. `STATUSLINE|missing`: the toolchain should have installed it. Give them a short note for `#ai-native-plative`, skip this lesson, and go on.
2. Run `node "<SKILL_DIR>/scripts/tutor.mjs" statusline-preview`. It prints `STATUSLINE|script|<path>` and the lines their practice window shows for the practice project, without colors, as `STATUSLINE|line|...` (the numbers are empty there; theirs will be real). Read that script: it says what each part means, its colors and its limits. Use what it says, never a generic description.
3. 💡 `Key Idea` "The bottom of your Claude window shows how your session is doing, at a glance." Explain it the way it appears in their practice window, using the preview: the first line is the folder and, for a GitHub project, `(project:branch)` with what the marks mean (`✓` in step with GitHub, `*` unsaved changes, an up arrow for saves not sent yet, a down arrow for newer work on GitHub). The second line is the model and effort, then how full the session is (the part that looks like `78K/1.0M (8%)`), then their 5-hour and 7-day allowance with when each resets. Give the colors and limits from the script, for example the session part turning orange and then red.
4. 👉 `Try It Yourself` "Look at the status line under the prompt in your practice window. Tell me the model and effort, the part that looks like 78K/1.0M (8%), and your 5h and 7d numbers." End your turn there.
5. Answer what they read, part by part: say what each means for them right now. Point out anything yellow or red. If the model or effort is not the team default (Sonnet, low effort), say what they are using and how to switch back with `/model`.
6. Then the ❓ `Knowledge Check` (header "Status line"): "Imagine the session part at the bottom has turned orange. What does it mean?" Options: the session is getting full, so tidy up soon (the best answer); Claude has made an error; your work is not saved; your allowance is used up.

Record `p9-statusline` with `--evidence "STATUSLINE|ok"` once they have answered.

## Give Claude a Project Guide [p9-init]

Why people love it: Claude starts every session already knowing the project and its house rules, so you stop repeating yourself, and the whole team can read and improve the guide like any other document.

1. 💡 `Key Idea` "`/init` asks Claude to read your project and write **CLAUDE.md**, a short guide to how this project works: what is in it, how you build and send work, and your rules. Every new session reads it first."
2. 👉 `Try It Yourself` In the practice window, type `/init` and press Return (Enter on Windows). Claude reads the project and writes CLAUDE.md. Then type: "Add to CLAUDE.md that every name I create starts with <prefix>, and send it to GitHub." End your turn there.
3. Check CLAUDE.md is on GitHub, as in Phase 5's Checking Their Work: the main version or any side copy counts.
4. Ask what they saw. Then ❓ `Knowledge Check` (header "Project guide"): "Imagine you keep reminding Claude of the same project rules at the start of every session. What fixes that?" Options: paste the rules in each time; put them in CLAUDE.md with /init (the best answer); use a bigger model; compact more often.

Record `p9-init` once CLAUDE.md is on GitHub and they have answered.

## Tidy Up Before the Session Gets Full [p9-compact]

Why people love it: long jobs stop falling apart halfway. You keep going in the same session with a clear head, and nothing important is lost because it is written down.

1. Start with a small piece of real work first, so there is something worth handing off. 👉 `Try It Yourself` In the practice window, type: "Read the flow (or the workflow, on NetSuite) I built in the exercises and tell me in three sentences what it does." End your turn and wait for their reply.
2. 💡 `Key Idea` "A very full session makes Claude's work worse: it starts losing track of early details. So before it gets full, you write down what matters, then shrink the session. Nothing important is lost, because it's written down."
3. 👉 `Try It Yourself` In the practice window, type: "Write a handoff note in notes/handoff.md: what we researched, what we found, what we decided, which files changed, and what comes next. Then send it to GitHub." Notes never hold passwords, tokens or customer data.
4. Then they type `/compact keep the renewal tracker work` and press Return. The session shrinks.
5. Then: "Read notes/handoff.md and tell me where things stand." Claude picks up from the note. End your turn there.
6. Ask what Claude said when it read the note back. If they skipped the compact or the read-back, ask them to do it now: those two moves are the lesson.
7. Check the note is on GitHub as in Phase 5's Checking Their Work: any new notes file counts, whatever its name.
8. ❓ `Knowledge Check` (header "Compacting"): "Imagine you're deep in a build and the part at the bottom that looks like 78K/1.0M (8%) turns orange. What do you do first?" Options: type /compact right away; ask Claude to write a handoff note, then compact (the best answer); start a new session and explain everything again; keep going until it turns red.

Record `p9-compact` with `--evidence "<the notes file> on GitHub"`.

## Send a Helper to Explore [p9-subagent]

Why people love it: big reading jobs that used to fill your session take a minute and come back as a tidy summary, and you can send several helpers at once.

1. 💡 `Key Idea` "Some jobs mean reading a lot: every flow in an org, or a big script. Instead of filling your session with it, ask Claude to send a helper, called a **subagent**. The helper reads in its own space and brings back a short summary, so your session stays focused."
2. 👉 `Try It Yourself` In the practice window, type: "Send a helper to read my flows and give me a short summary of each one." (NetSuite: "Send a helper to read my workflows and give me a short summary of each one.") Keep it to one folder, so it finishes in a minute or two.
3. Ask what they see. They should see Claude start a helper, then a short summary.
4. ❓ `Knowledge Check` (header "Subagents"): "Imagine a customer asks you to review all 40 flows in their org. What's the best start?" Options: paste every flow into your session; send a subagent to read them and summarize (the best answer); read them yourself first; ask for fewer flows.

Record `p9-subagent` once they have seen the summary and answered.

## Go Back a Step [p9-rewind]

Why people love it: mistakes stop being expensive. Instead of arguing Claude back on track, you go back one step and ask better. It is the undo button people wish every tool had.

1. 💡 `Key Idea` "When Claude heads the wrong way, you don't have to fix it forward. Type `/rewind`, or press Esc twice, and pick an earlier message. You choose to undo the conversation, the changes to your files, or both, then ask again more clearly. It only undoes changes on your computer, not anything already sent to your org or GitHub, and not changes made by commands Claude ran."
2. 👉 `Try It Yourself` In the practice window, ask Claude a question, for example: "Which of my renewals end soonest?" When Claude has answered, type `/rewind` (or press Esc twice), pick the question you just asked, and choose to restore the conversation. The question and the answer disappear, as if you never asked. End your turn there.
3. Ask what they saw.
4. ❓ `Knowledge Check` (header "Rewind"): "Imagine Claude deployed a wrong change to your sandbox, and you rewind. What happens in the sandbox?" Options: the change is undone there too; nothing, the sandbox keeps the change (the best answer); the sandbox is reset; Claude asks first.

Record `p9-rewind` once they have rewound and answered.

## Come Back to a Session [p9-resume]

Why people love it: closing a window, restarting the laptop or stopping for lunch no longer costs you the thread. Claude picks up exactly where you were.

1. 💡 `Key Idea` "You don't have to start over when you close a window. `/resume` shows your earlier sessions in this folder: pick one, and Claude carries on with everything it knew. From the terminal, `claude --continue` reopens the last one directly."
2. 👉 `Try It Yourself` In the practice window, type `/exit`. Then type `claude --continue` and press Return (Enter on Windows): the conversation is back. Then type `/resume` to see the list of earlier sessions, and press Esc to close it. End your turn there.
3. Ask what they saw. Then ❓ `Knowledge Check` (header "Resume"): "Imagine you closed VS Code mid-build yesterday. What's the quickest way back to where you were in your Claude Code session?" Options: start a new session and explain everything again; run `claude --continue` or `/resume` in the same folder (the best answer); scroll back in the terminal; ask Claude to remember yesterday.

Record `p9-resume` once they have answered.

## Carry On From Your Phone [p9-remote]

Why people love it: start a long build at your desk, then check on it from a meeting or on the way home, and answer Claude's questions without going back to your computer.

1. 💡 `Key Idea` "`/rc`, short for `/remote-control`, lets you follow and steer this same session from the Claude app on your phone, or from claude.ai/code in a browser, while Claude keeps working on your computer. Your computer must stay awake with the window open, and one session connects at a time."
2. 👉 `Try It Yourself` In the practice window, type `/rc` and press Return. Scan the QR code with your phone's camera, or open the link it shows. Send one short message from your phone, such as "What files changed today?", and watch it appear in VS Code. End your turn there.
3. If it says Remote Control is not available, that is an organization setting: on Team and Enterprise plans an Owner switches it on. Give them a short note for `#ai-native-plative` and record the step anyway.
4. Ask what they saw. Then ❓ `Knowledge Check` (header "Remote"): "Imagine you start a long build and need to leave your desk. How do you keep an eye on it?" Options: close the laptop and check later; run `/rc` and follow it from the Claude app, leaving the computer awake (the best answer); email yourself the output; start a new session on your phone.

Record `p9-remote` once they have answered.

## Close the Phase

Refresh the outline page, run `node "<SKILL_DIR>/scripts/tutor.mjs" map` and show the course card exactly as printed, in a code block. Say "You've picked up seven habits that help you work longer and cleaner. Next: 10, Ongoing Coaching."
