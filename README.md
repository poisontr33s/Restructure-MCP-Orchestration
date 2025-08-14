# MCP Orchestration System

> SYSTEM STATUS: ORCHESTRATION PROTOCOLS ACTIVE

## Om
Et moderne orkestreringsystem for Model Context Protocol (MCP) tjenere, designet for 2025. Dette systemet tilbyr en sentralisert plattform for håndtering av ulike MCP-tjenere gjennom en modulær TypeScript-arkitektur.

## Strukturell Tektonikk
- Monorepo-struktur med PNPM workspace og klart separerte ansvarsområder
- Modulær arkitektur med pluginbasert tilnærming for enkel utvidelse
- Full TypeScript-støtte med sterk typing og moderne utviklingsverktøy
- Sentral overvåkning og administrasjon av alle MCP-tjenere

## Hovedfunksjoner
- **Sentralisert administrasjon**: Start, stopp og overvåk alle MCP-tjenere fra ett grensesnitt
- **Sanntidsovervåking**: Dashboard for tjenerestatus, systemressurser og logger
- **Helsesjekk**: Automatiske helsesjekker og statusoppdateringer
- **CLI-støtte**: Kommandolinjebasert administrering av tjenere

## Relasjoner
- [Meta-index](https://github.com/poisontr33s/poisontr33s) - Katalogisering og oversikt
- [Konsept-node](https://github.com/poisontr33s/PsychoNoir-Kontrapunkt) - Konseptuell inspirasjon for systemdesign

## Installasjon og bruk
Se den tekniske dokumentasjonen i prosjektmappene for detaljerte instruksjoner.

## AI-Powered Code Analysis

This repository includes automated code analysis using AI-powered tools to maintain code quality and provide intelligent insights:

### 🤖 Gemini CLI Integration

Google's Gemini CLI provides comprehensive code analysis, review, and intelligent suggestions.

**Setup:**
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to your repository secrets
3. The workflow runs automatically on pushes and PRs

**Features:**
- **Code Review**: Automated code quality analysis
- **Security Scanning**: Vulnerability detection and security best practices
- **Documentation Check**: Documentation completeness and clarity review
- **Full Analysis**: Comprehensive code, security, and documentation review

**Manual Trigger:**
```bash
# Via GitHub UI: Actions → Gemini CLI Analysis → Run workflow
# Select analysis type and target package
```

**Local Usage:**
```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Configure API key
export GEMINI_API_KEY="your-api-key"

# Run analysis on specific package
cd packages/core
gemini --model=gemini-2.0-flash-exp --all-files --prompt="Review this code for quality and best practices"
```

### 🤖 Claude Code CLI Integration

Anthropic's Claude provides focused code analysis with streaming output and specialized code review capabilities.

**Setup:**
1. Get an Anthropic API key from [Anthropic Console](https://console.anthropic.com/)
2. Add `ANTHROPIC_API_KEY` to your repository secrets
3. The workflow runs automatically on pushes and PRs with intelligent scope detection

**Features:**
- **Incremental Analysis**: Analyzes only changed files for efficiency
- **Package-Focused**: Deep analysis of specific packages
- **Full Codebase**: Comprehensive analysis when needed
- **Multiple Focus Areas**: Code quality, architecture, performance, refactoring

**Analysis Focus Options:**
- `code-quality`: Best practices, type safety, error handling
- `architecture`: System design, patterns, dependencies
- `performance`: Optimization opportunities, bottlenecks
- `refactoring`: Code duplication, modernization suggestions

**Manual Trigger:**
```bash
# Via GitHub UI: Actions → Claude Code CLI Analysis → Run workflow
# Select scope, package, and focus area
```

**Local Usage:**
```bash
# Install Claude CI tool
npm install -g @mneuhaus/claude-ci

# Configure API key
export ANTHROPIC_API_KEY="your-api-key"

# Run analysis with custom prompt
echo "Analyze this code for performance issues" | claude-ci
```

### 🔧 Workflow Optimization

Both AI analysis workflows are optimized to reduce resource usage (addressing CI/CD efficiency goals):

- **Smart Triggering**: Only runs when relevant files change
- **Selective Package Analysis**: Targets specific packages based on changes
- **Intelligent Caching**: Leverages pnpm and artifact caching
- **Configurable Scope**: Manual control over analysis breadth

### 📊 Analysis Reports

AI analysis results are available in multiple formats:
- **Workflow Artifacts**: Full reports downloadable for 30-90 days
- **PR Comments**: Summary insights posted directly to pull requests
- **Consolidated Reports**: Combined analysis across all packages
- **Structured Output**: Markdown format with clear sections and recommendations

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
