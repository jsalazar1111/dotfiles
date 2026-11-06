# Phase 3: Get Comfortable

This phase runs in one session, with you leading. Examples come from the person's platform: a Salesforce DX project or a SuiteCloud SDF project, inside their learning folder.

## Model and Effort [p3-model]

Teach this before anything else. The setting was made at the start, so this lesson is about when to change it.

1. If they are on Sonnet with low effort, say "You're already on the everyday setting", then teach steps 2 and 3 in full: the person has not heard them yet, so never skip them and never replace them with a one-line summary. Otherwise the person types `/model` and picks Sonnet, then types `/effort low`. Confirm the model and effort on their status line.
2. Explain which model suits which job. Use the names they see in `/model` and on the status line, never a version number:
   - Haiku: fast and light, for quick lookups such as "what does this field do?"
   - Sonnet: everyday building, such as flows, Apex and configuration. Their default.
   - Opus: the strongest, for planning, hard analysis and tricky debugging. It uses their allowance faster, so they use it when the work needs it.
3. Raise the effort only when the work is hard, and set it back afterward. The status line always shows the model and effort in use.

Write out steps 2 and 3 as a short message to the person first. Only after that, check it with one question in the multiple-choice picker, for example: "❓ Knowledge Check: Imagine a deployment fails with an error you can't trace after two tries. What would you do?" Options: keep going on Sonnet at low effort; switch to Opus and raise the effort, then set it back to Sonnet at low effort once it is fixed (the best answer); switch to Haiku; restart Claude Code.

Record `p3-model` when the person is on Sonnet with low effort and can say when they would change it.

## Terminal and VS Code Basics [p3-comfort]

Assume they have never used VS Code. Give one step at a time, say exactly where to click or what to type, say what they should see, and ask what they see before the next step.

**First, prepare a small sample project for them.** Do this yourself, in their learning folder (`~/plative-learning`, or `%USERPROFILE%\plative-learning` on Windows), and tell them only "I've made a small practice project for you."

- Salesforce: `sf project generate --name my-first-project --output-dir <learning folder>`.
- NetSuite: create an account customization project named `my-first-project` in the learning folder with the SuiteCloud CLI (`suitecloud project:create`). Check `suitecloud project:create --help` for the options that avoid questions.
- If the command fails, make the folder `my-first-project` with a short `README.md` that describes their platform, so the lesson can go on.

**Then walk through VS Code:**

1. Open VS Code. Mac: press Command+Space, type "Visual Studio Code" and press Return. Windows: press Start, type "Visual Studio Code" and click it. A window opens, often with a Welcome tab. They can close the Welcome tab with the small x on the tab.
2. Open the practice project. Click the File menu at the top, then Open Folder. Go to their home folder, then `plative-learning`, click `my-first-project` once, and click Open. On a Mac, Command+Shift+H in that window jumps to the home folder.
3. Plative laptops have VS Code's trust question turned off, so usually nothing appears. If VS Code does ask "Do you trust the authors of the files in this folder?", they tick the box to trust the parent folder 'plative-learning', then click "Yes, I trust the authors". This is their own project, and the box means VS Code will not ask again for anything in their learning folder.
4. Look around. The panel on the left is the Explorer: it lists the project's folders and files. Clicking a folder opens it. Clicking a file shows it in the large area on the right, the editor. Name one file to open: `sfdx-project.json` for Salesforce, or `manifest.xml` in `src` for NetSuite. Say they can look but need not change anything.
5. Open VS Code's built-in terminal. Click the Terminal menu at the top, then New Terminal. A terminal opens with a prompt, already in the project folder. Do not assume where it appears: some people have it at the bottom of VS Code, others beside the editor tabs. Ask them to tell you where it is, and use that wording.
6. Start Claude there. They type `claude` and press Return. It is the same Claude Code they already use, now inside VS Code. If it asks whether to trust the folder, they choose Yes. Ask them to type a short question about the project, such as "What is in this project?", then type `/exit` to leave.
7. Say that the terminal they started the course in works the same way: the `claude` command runs in any terminal, inside or outside VS Code.

Record `p3-comfort` when they have started `claude` in VS Code's built-in terminal.

## Close the Phase

Refresh the outline page. Say "You're comfortable with Claude Code and VS Code. Next: saving and sharing your work with GitHub." Then load `modules/phase-4-git.md`.
