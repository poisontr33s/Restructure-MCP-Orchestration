# THE MONOREPO RITUAL: A Guide for Sisters, Siblings, and Silent Spectators

> *Whalecum, Cpt. Guthilda "Triple-:D'Cup" Piroteena".* 🔥😈🏴‍☠️🔗💦🌋🌊🌀⚓ Fractal Id: *[Feather.Weeds.Subordinate](www.pornhub.com/
* ***(You stand before the Orchestration System, a house of many rooms—each with its own secrets. This is the step-by-step to make sense of the labyrinth, keep your dependencies sane, and dance with pnpm *(never npm).***

---

## 1. The Root Chamber (Root `package.json`)

- **Purpose:** Holds all tools, scripts, and devDependencies shared across your whole project.
- **What goes here:**
  - All general devDependencies: typescript, turbo, prettier, eslint, tsup, vitest, @types/node (and others used by all packages).
  - All main scripts, such as build, lint, format, test, start.
- **How:**
  - Open the root `package.json` file (at the top level of your repo).
  - Move/add all common devDependencies and scripts here.
  - Remove these dependencies from any sub-package unless they’re truly unique.

---

## 2. The Side Chambers (Packages in `packages/`)

- **Purpose:** Each sub-folder in `packages/` is a separate package/module.
- **What goes here:**
  - Only unique dependencies or devDependencies needed for that specific package.
  - Example: If `@types/inquirer` is only needed in `cli`, keep it in `packages/cli/package.json`.
- **How:**
  - Check each `packages/*/package.json`.
  - Remove any devDependency that is already provided at the root, unless it must be a different version.
  - Leave only what is specific to this package.

---

## 3. Adding and Managing Dependencies
- **Always use pnpm. Never use npm.**

- **To add a devDependency for ALL packages:**

  pnpm add -D <package>

- **To add a devDependency to only ONE package:**

  pnpm add -D <package> --filter <package-folder>

- **If you ever see `package-lock.json` or rogue `node_modules`, delete them and run:**

  pnpm install

---

## 4. Scripts and Automation
- **Define shared scripts in the root `package.json`.**

- **Run scripts for all packages at once using turbo:**

  pnpm build
  pnpm lint
  pnpm format
  pnpm test

- **If a package needs its own special script, define it in that package’s `package.json`.**

---

## 5. Dependabot (Automatic Dependency Updates)

- **File:** `.github/dependabot.yml`
- **What to do:**
  - For every `package.json` (root and each package), add a stanza under `updates:` specifying the directory.
  - The root always gets its own stanza (directory: "/").
  - Each package with a `package.json` also gets a stanza (e.g., directory: "/packages/cli").

---

## 6. Housekeeping

- **.eslintrc.json:**
  - Keep this at the root for consistent linting rules.
- **.prettierrc:**
  - Keep this at the root for consistent formatting.
- **pnpm-workspace.yaml:**
  - Lists all your packages, typically with `packages/*`.
- **.vscode/tasks.json:**
  - Optional! Custom VS Code tasks for your workflow.

---

## 7. The Floorplan (Structure Example)

repo-root/
├── package.json             # All shared devDependencies & scripts
├── pnpm-workspace.yaml      # Points to 'packages/*'
├── .github/
│   └── dependabot.yml       # Dependency update config
├── .eslintrc.json           # Linting config
├── .prettierrc              # Prettier config
├── packages/
│   ├── core/
│   │   └── package.json     # Only core-specific deps
│   ├── cli/
│   │   └── package.json     # Only cli-specific deps
│   └── ...                  # More packages as needed
└── .vscode/
    └── tasks.json           # Optional VS Code tasks

---

## 8. Your Ritual Checklist

- [ ] All shared devDependencies/tools/scripts live in the root `package.json`.
- [ ] Each sub-package only has its own unique dependencies.
- [ ] You always use pnpm and clean up after npm if needed.
- [ ] Shared scripts are in the root; unique ones live in their own package.
- [ ] Dependabot watches every package.
- [ ] Lint and formatting configs are at the root.

---

## 9. What Not To Do

- Never run npm install or add dependencies with npm.
- Never duplicate devDependencies in both the root and a sub-package (unless you need a different version).
- Don’t put package-specific dependencies in the root.

---

## 10. Final Wisdom

> **When all is in order, your monorepo is clean, fast, and easy to manage. Everyone dances to the same beat, and no folder is left behind.**

**If you add new packages, update your workspace map and dependabot config. The ritual is now yours. You are the Librarian, the DJ, the Sister, the Boolean Daughter, and the Keeper of the Floor.**

---

>> ***Now, code. And let the repo groove on forever.***

---

Let me know if you want further breakdowns, more code samples, or examples of each file’s contents? 
