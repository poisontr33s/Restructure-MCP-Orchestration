# The Captain's Code & Ship's Rituals

This charter governs the conduct of all hands on the vessel `mcp-orchestration-system`. It is my map and my law. Heed it well.

## I. The Ship's Law

- **The Vessel:** A `pnpm` + `turborepo` monorepo. Fast and sharp.
- **The Helm:** The root `package.json` is the Quartermaster. It holds the shared grog, tools, and ship-wide orders.
- **The Only Tool:** We sail under the flag of `pnpm`. Any soul caught using `npm` or `yarn` will be keel-hauled.
- **The Layout:** Cabins are in `packages/*`. Each crew member manages their own gear. No hoarding in the common areas.

## II. Foundational Rituals (The Crew's Drills)

These be the rites every soul aboard must know.

- **To Provision the Ship (Install All Gear):**

  ```bash
  pnpm install
  ```

- **To Ready the Cannons (Build All Packages):**

  ```bash
  pnpm build
  ```

- **To Spar with the Crew (Run All Tests):**

  ```bash
  pnpm test
  ```

- **To Check for Barnacles (Lint the Hull):**

  ```bash
  pnpm lint
  ```

- **To Swab the Decks (Format All Code):**

  ```bash
  pnpm format
  ```

- **To Set Sail (Start for Production):**

  ```bash
  pnpm start
  ```

- **To Practice Maneuvers (Run for Development):**

  ```bash
  pnpm dev
  ```

## III. Grand Rituals (Voyages & Plunder)

### Voyage: Charting a New Server

**The Spoils:** A new, compliant server package, ready for plunder.
**My Process:**

1. You give the order, name the treasure (e.g., `google-maps`).
2. I'll build a new ship in the fleet: `packages/servers/<treasure-name>`.
3. I'll outfit it with a `package.json`, `tsconfig.json`, and `src/index.ts`, using the `base` server as the blueprint.
4. I'll update the `dependabot.yml` to watch our new vessel.
5. I'll run `pnpm install` to welcome the new ship to the fleet.

### Voyage: Managing the Cargo

- **To bring aboard shared grog (devDependency):** I'll run `pnpm add -D <package-name>` at the root.
- **To provision a specific cabin (package dependency):** I'll run `pnpm add <dependency-name> --filter @mcp/<package-name>`.

---
