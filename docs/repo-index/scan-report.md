# Repository Scan Report

- Generated: 2025-08-14T12:44:49.114Z
- Files scanned: 180

## Duplicates

- File duplicates: 2
  - 3 files share SHA1 7ad96e1b2bf0b7c317cc1f5f6f887ca9df0c8dd9:
    - packages/shared/tsconfig.json
    - packages/cli/tsconfig.json
    - packages/core/tsconfig.json
  - 3 files share SHA1 42d92ad456b387ae42edfb4c66eb2cd18b9c9b08:
    - packages/servers/sequential-thinking/tsconfig.json
    - packages/servers/duckduckgo/tsconfig.json
    - packages/servers/base/tsconfig.json

## Markdown Duplicates

- Duplicates: 0

## Rogue Lockfiles

- None

## Nested node_modules (should not exist in pnpm monorepo)

- packages\core\node_modules\zod
- packages\core\node_modules\winston
- packages\core\node_modules\node-fetch
- packages\core\node_modules\express-rate-limit
- packages\core\node_modules\express
- packages\shared\node_modules\zod
- packages\cli\node_modules\ora
- packages\cli\node_modules\inquirer
- packages\cli\node_modules\commander
- packages\cli\node_modules\chalk
- packages\monitor\node_modules\zustand
- packages\monitor\node_modules\vite
- packages\monitor\node_modules\tailwindcss-animate
- packages\monitor\node_modules\tailwindcss
- packages\monitor\node_modules\tailwind-merge
- packages\monitor\node_modules\react-dom
- packages\monitor\node_modules\react
- packages\monitor\node_modules\postcss
- packages\monitor\node_modules\lucide-react
- packages\monitor\node_modules\clsx
- packages\monitor\node_modules\autoprefixer
- packages\servers\duckduckgo\node_modules\node-fetch
- packages\core\node_modules\@types\express
- packages\core\node_modules\@mcp\shared
- packages\cli\node_modules\@types\inquirer
- packages\cli\node_modules\@mcp\shared
- packages\cli\node_modules\@mcp\core
- packages\monitor\node_modules\@vitejs\plugin-react-swc
- packages\monitor\node_modules\@tanstack\react-query
- packages\monitor\node_modules\@types\react-dom
- packages\monitor\node_modules\@types\react
- packages\monitor\node_modules\@tailwindcss\postcss
- packages\monitor\node_modules\@mcp\shared
- packages\servers\sequential-thinking\node_modules\@mcp\shared
- packages\servers\sequential-thinking\node_modules\@mcp\server-base
- packages\servers\base\node_modules\@mcp\shared
- packages\servers\duckduckgo\node_modules\@mcp\shared
- packages\servers\duckduckgo\node_modules\@mcp\server-base
- packages\servers\kraken\node_modules\@mcp\shared

## Large Files (>10MB)

- None

## Huge Files (>=1GB)

- None

## Folder Size Census (includes dist/build, excludes node_modules/.git)

- Top 15 largest folders:
  - docs 59.40 MB
  - scripts 0.44 MB
  - packages 0.38 MB
  - packages/monitor 0.25 MB
  - pnpm-lock.yaml 0.15 MB
  - packages/core 0.05 MB
  - packages/servers 0.04 MB
  - sessions 0.02 MB
  - agent 0.02 MB
  - packages/cli 0.02 MB
  - preload-sessions 0.02 MB
  - packages/shared 0.01 MB
  - session-dna 0.01 MB
  - packages/unified-engine 0.01 MB
  - MULTI-AGENT-CROSS-POLLINATION.md 0.01 MB
- Median: 0.01 MB, MAD: 0.01 MB
- Outliers (size far from median):
  - docs 59.40 MB
  - scripts 0.44 MB
  - packages 0.38 MB
  - packages/monitor 0.25 MB
  - pnpm-lock.yaml 0.15 MB
  - packages/core 0.05 MB

## Dist/Build Directories in Repo

- None

## Packages Audit

### @mcp/unified-engine (packages/unified-engine)

- Dev dep duplicates with root: 0
- Unused declared deps: 0
- Missing declared deps (used but not listed): 1
  - child_process

### @mcp/shared (packages/shared)

- Dev dep duplicates with root: 0
- Unused declared deps: 0
- Missing declared deps (used but not listed): 0

### @mcp/monitor (packages/monitor)

- Dev dep duplicates with root: 0
- Unused declared deps: 6
  - @mcp/shared, @tanstack/react-query, zustand, @tailwindcss/postcss, @vitejs/plugin-react-swc, postcss
- Missing declared deps (used but not listed): 4
  - @vitejs, @tailwindcss, @tanstack, @mcp

### @mcp/core (packages/core)

- Dev dep duplicates with root: 0
- Unused declared deps: 3
  - @mcp/shared, node-fetch, zod
- Missing declared deps (used but not listed): 6
  - @mcp, child_process, path, http, fs, os

### @mcp/cli (packages/cli)

- Dev dep duplicates with root: 0
- Unused declared deps: 2
  - @mcp/core, @mcp/shared
- Missing declared deps (used but not listed): 1
  - @mcp
