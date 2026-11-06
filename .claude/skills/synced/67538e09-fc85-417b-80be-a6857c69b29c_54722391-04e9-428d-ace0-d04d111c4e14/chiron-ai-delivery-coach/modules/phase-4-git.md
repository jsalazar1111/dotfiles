# Phase 4: Git and GitHub Basics

This phase runs in one session, with you leading. The person learns on their own practice project, the `my-first-project` folder from the last phase (`practiceRepo` in `config.json`). It sits in their learning folder: `~/plative-learning/my-first-project`, or `%USERPROFILE%\plative-learning\my-first-project` on Windows.

Teach each idea the same way: explain it in one plain sentence, let the person ask for it in their own words, then do it and show them what happened. Say "project" or "GitHub project", never "repo", in what they hear.

On GitHub, name every button by its label and where it is. Before any step on GitHub, say how to get to the right page first, because they may still be on the page from the step before. To get to the project's main page from anywhere in it: "Click the project name, **my-first-project**, at the top left of the page, next to your account name. You can also click the **Code** tab just below it." GitHub's layout changes over time: if they cannot find something, ask them to paste a screenshot and point to it.

Check their work with `node "<SKILL_DIR>/scripts/tutor.mjs" check-practice`. It finds the practice project in the learning folder itself, and prints `PRACTICE|` lines: `repo`, `commits`, `pushed`, `pulled`, `web-edit` and `merged-prs`. When `repo` is not `ok`, it prints only that line, except when offline:

- `no-folder|<folder>|<name>`: the practice project is not on this computer. Check GitHub with `gh repo view <name>`:
  - If GitHub has it, they worked through this phase on another computer. Bring it down with `gh repo clone <name> "<folder>"`, using the full folder path the line prints, and say "I've brought your practice project onto this computer." This is the clone they learn about below.
  - If GitHub does not have it, they did the last phase on another computer, so the sample project never reached this one. Make it now, as the last phase did, in the learning folder: Salesforce `sf project generate --name my-first-project --output-dir <learning folder>`, NetSuite `suitecloud project:create` (check `--help` for the options that avoid questions). Say "I've made a small practice project for you on this computer." Then start at the first step.
- `offline`: the laptop has no internet connection. The lines after it show what this computer knows. Say "Your computer seems to be offline. You can keep working, and I'll check with GitHub once you're back online." Record nothing that needs GitHub until it is back.
- `no-git` or `no-remote`: they have not put it on GitHub yet. Start at the first step, which makes it a Git project.
- `not-private`, `not-own` or `not-main`: say plainly what is wrong, and help them fix it on GitHub. Never change it yourself without asking.
- `not-found`: GitHub cannot find it. Check they are signed in with `gh auth status`, and send a note to `#ai-native-plative` if that does not explain it.

## Your Practice Project on GitHub [p4-repo]

1. If Git has no name or email yet (`git config --global user.email` prints nothing), set both. The email is their Plative sign-in email. The name is their GitHub display name (`gh api user --jq .name`). If GitHub has no name, or you are not sure, ask "What name should show on your saved versions?" and use exactly their answer. Never make a name up from their email or anywhere else. Then run `git config --global user.name "<name>"` and `git config --global user.email "<email>"`, and say as the setup line "I've told Git your name and email, so your saved versions show they're yours." If they are already set, say nothing about Git's name and email.
2. 💡 `Key Idea` "GitHub keeps a private copy of your project online, visible only to you. Each time you save a version, you send it there, so your work is backed up. At Plative, every GitHub project must be private. A public project can be seen and searched by anyone on the internet, which would expose Plative and customer information."
3. 👉 `Try It Yourself` "Ask me, in your own words, to put your practice project on GitHub as a private project." When they ask: if the folder is not yet a Git project (`check-practice` says `no-git`), make it one first, with `main` as the main version: `git init -b main`, then `git add -A` and `git commit -m "First version"`, all in the practice folder. Then create it in their own account: `gh repo create <practiceRepo> --private --source "<practice folder>" --remote origin --push`. Never create it in the Plative organization. If the name is already taken in their account by something else, use `<practiceRepo>-2`, tell them, and run `node "<SKILL_DIR>/scripts/tutor.mjs" set-practice-repo <practiceRepo>-2` so a new computer finds it.
4. Open it in their browser with `gh repo view --web`, run from the practice folder. Ask what they see: the project name with a small "Private" label, and the list of files.

Record `p4-repo` when `check-practice` shows `repo|ok` and `pushed|ok`.

## Saving Versions and Comparing Them [p4-versions]

1. Explain: "Each time you save a version, Git keeps a snapshot. You can always see what changed between two snapshots."
2. The person asks for a small change that rewrites a line and adds one, for example "Change the first line of the README to say what this project is for, add a line about me, then save a version and send it to GitHub." Make the change, commit with a clear message, and push.
3. On GitHub, click by click: go to the project's main page. Refresh the page first: press Command+R on a Mac or Ctrl+R on Windows, or click the circular arrow left of the address bar. Near the top right of the file list, click the clock icon with the word "commits". They see each saved version, newest first. Click the newest one.
4. Explain what they see: lines marked `+` were added, and lines marked `-` were removed. A rewritten line shows as one of each. GitHub usually shades them green and red, or blue and orange in some color settings, so go by the marks.

Record `p4-versions` when `check-practice` shows `commits|2` or more and `pushed|ok`.

## GitHub Is Your Backup [p4-backup]

1. Explain: "Your project now lives in two places: this computer and GitHub. If this laptop is lost, nothing is lost. On a new computer, one command copies the whole project back. That copy is called a **clone**."
2. They make a change on the GitHub website, click by click: go to the project's main page, and click `README.md` in the file list. Click the pencil icon at the top right of the file. Type a new line at the end. Click **Commit changes** at the top right, then **Commit changes** again in the box that opens.
3. Now their computer is one version behind. They ask Claude, in their own words, to bring the latest version down from GitHub. Run `git pull` in the practice folder, then show them the new line in the file.
4. Check it with one question in the multiple-choice picker: "❓ Knowledge Check: Imagine your laptop stopped working tomorrow. What would happen to your practice project?" Options: it would be lost; it would be safe on GitHub, and a clone would bring it back on a new computer (the best answer); only the last version would be safe; you would have to email it to yourself.

Record `p4-backup` when `check-practice` shows `web-edit|yes` and `pulled|ok`.

## Trying a Change Safely [p4-branch]

1. Explain branching before they make one. Always give this explanation, using these exact words, so nothing is overstated:
   - "A **branch** is a working copy of your project. You make changes there while the main version stays exactly as it was. It's like copying a document to try edits, and keeping the original safe."
   - "Every Plative project moves through stages like Build, QA, UAT and Production. Git can follow the same path. You build each change on its own branch. A **pull request** then moves it toward the next stage, and someone reviews it at each step. So work only reaches Production after it has passed the earlier stages."
   - "If you like the change, you **merge** it into the main version. If not, you leave the branch alone, and the main version never sees it."
   - The main version is called `main` at Plative, never `master`. Today they practice the first move, from a branch into `main`. Real projects repeat that move for each stage.
2. The person asks for a change on a new branch with a pull request, for example "Add an 'Intro to GitHub' section on a new branch, and open a pull request." Create the branch, commit, push, and open the pull request with `gh pr create`.
3. Show them the branch, click by click: go to the project's main page. Refresh the page first: press Command+R on a Mac or Ctrl+R on Windows, or click the circular arrow left of the address bar. Above the file list, click the button that shows **main**. This is the branch picker: it lists every branch. Click the new branch, then `README.md`: the new section is there. Open the branch picker again and click **main**: the section is not there yet. "View all branches" at the bottom of the branch picker shows every branch on one page.
4. Find the pull request without a link: click the **Pull requests** tab at the top of the project page. Open pull requests are listed first; merged ones are under **Closed**. Click theirs.
5. Review and merge, click by click: click the **Files changed** tab to see exactly what is different, marked `+` and `-`. Then click the **Conversation** tab, scroll to the bottom, and click **Merge pull request**, then **Confirm merge**. If they do not see it, ask them to paste a screenshot.
6. GitHub then offers **Delete branch**. It is optional and their choice: leaving the branch is fine. Never delete it for them.
7. They ask Claude to bring the main version up to date. Switch back to `main` and run `git pull`.
8. Check it with one question in the multiple-choice picker: "❓ Knowledge Check: Imagine QA finds a problem with your flow. Where do you fix it?" Options: directly in Production; on your branch, then a new pull request through QA again (the best answer); in the UAT stage; ask the customer to fix it.
9. Finish where they started: go to the project's main page. Refresh the page first: press Command+R on a Mac or Ctrl+R on Windows, or click the circular arrow left of the address bar. Then click `README.md`. It now includes the section from their branch. That is the main version, with their change merged in. Then show them the same file on their computer, so they see the two match.

Record `p4-branch` when `check-practice` shows `merged-prs|1` or more and `pulled|ok`.

## Close the Phase

Refresh the outline page. Say "You've learned the everyday GitHub moves. Next: planning and testing with Claude, the way Plative works." Then load `modules/phase-5-plative-way.md`.
