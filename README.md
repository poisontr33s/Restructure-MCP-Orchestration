# MCP Orchestration System

> SYSTEM STATUS: ORCHESTRATION PROTOCOLS ACTIVE

## Om

Et moderne orkestreringsystem for Model Context Protocol (MCP) tjenere, designet for 2025. Dette systemet tilbyr en sentralisert plattform for håndtering av ulike MCP-tjenere gjennom en modulær TypeScript-arkitektur.

## Strukturell Tektonikk

- Monorepo-struktur med PNPM workspace og klart separerte ansvarsområder
- Modulær arkitektur med pluginbasert tilnærming for enkel utvidelse
- Full TypeScript-støtte med sterk typing og moderne utviklingsverktøy
- Sentral overvåkning og administrasjon av alle MCP-tjenere
- **AI-Powered Development**: Integrated Gemini CLI and Claude Code CLI for enhanced development workflows

## Hovedfunksjoner

- **Sentralisert administrasjon**: Start, stopp og overvåk alle MCP-tjenere fra ett grensesnitt
- **Sanntidsovervåking**: Dashboard for tjenerestatus, systemressurser og logger
- **Helsesjekk**: Automatiske helsesjekker og statusoppdateringer
- **CLI-støtte**: Kommandolinjebasert administrering av tjenere
- **AI Integration**: Gemini CLI and Claude Code CLI for intelligent code analysis and assistance

## AI-Powered Development Tools

### Gemini CLI Integration
Google's official Gemini CLI is integrated into the development workflow for AI-powered code analysis and assistance.

**Setup:**
1. Obtain a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add the API key as a repository secret named `GEMINI_API_KEY`
3. The Gemini CLI workflow will automatically run on relevant code changes

**Capabilities:**
- AI-powered code analysis and suggestions
- Automated code review assistance
- Integration with MCP orchestration workflows
- Enhanced development productivity tools

**Usage:**
```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Analyze TypeScript code
gemini analyze src/index.ts

# Get code suggestions
gemini suggest --file src/component.ts
```

### Claude Code CLI Integration
Advanced AI code assistance using Anthropic's Claude models for intelligent code review and development support.

**Setup:**
1. Obtain an Anthropic API key from [Anthropic Console](https://console.anthropic.com/)
2. Add the API key as a repository secret named `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`
3. The Claude CLI workflow will automatically run on relevant code changes

**Available Tools:**
- **@claude-vector/cli**: Vector-based code search with Claude AI
- **@mneuhaus/claude-ci**: Automated Claude interactions for CI/CD
- **Anthropic API**: Direct integration with Claude models

**Capabilities:**
- AI-powered code analysis and suggestions
- Automated code review assistance
- TypeScript and React-specific optimizations
- Integration with MCP orchestration workflows
- Enhanced development productivity

**Usage:**
```bash
# Install Claude CLI tools
npm install -g @claude-vector/cli @mneuhaus/claude-ci

# Analyze TypeScript code
claude-vector analyze src/index.ts

# Get code suggestions
claude-ci suggest --file src/component.tsx

# Code review automation
claude-ci review --diff HEAD~1
```

## Installation and Development

### Prerequisites
- Node.js 20+ (LTS)
- pnpm 9+
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/poisontr33s/Restructure-MCP-Orchestration.git
cd Restructure-MCP-Orchestration

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Start development servers
pnpm run dev
```

### AI CLI Setup (Optional)
To enable AI-powered development features:

1. **For Gemini CLI:**
   - Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Set `GEMINI_API_KEY` environment variable or repository secret

2. **For Claude CLI:**
   - Get API key from [Anthropic Console](https://console.anthropic.com/)
   - Set `ANTHROPIC_API_KEY` environment variable or repository secret

## Workflow Optimization

The project includes optimized GitHub Actions workflows that:
- **Reduce runner usage** through strategic matrix builds and path-based triggers
- **Use modern tool versions** (Node.js 20, pnpm 9)
- **Implement efficient caching** for faster build times
- **Follow Artifact v4 patterns** for reliable CI/CD artifact handling
- **Include comprehensive testing** with AI tool integration

## Relasjoner

- [Meta-index](https://github.com/poisontr33s/poisontr33s) - Katalogisering og oversikt
- [Konsept-node](https://github.com/poisontr33s/PsychoNoir-Kontrapunkt) - Konseptuell inspirasjon for systemdesign

## Installasjon og bruk

Se den tekniske dokumentasjonen i prosjektmappene for detaljerte instruksjoner.

> Orchestration is not control; it's conversation with chaos.

## Vedlikehold: Rydding av grener
- Åpne GitHub → Actions → "Cleanup branches"
- Velg input:
	- target_branch: eksakt navn for én gren (overstyrer pattern)
	- pattern: regex for å velge flere grener (f.eks. `^agent/|^chore/`)
	- merged_only: true for kun sammenslåtte grener (standard)
	- dry_run: true for forhåndsvisning (standard). Sett til false for faktisk sletting
	- exclude_patterns: ekstra regex unntak (default beskytter main/master/develop/release/gh-pages)
- Kjør workflow. Start med dry_run=true, verifiser listen, kjør deretter med dry_run=false når trygt.
