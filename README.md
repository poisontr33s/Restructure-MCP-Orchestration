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
- **🌉 Repository Bridge System**: Universal bridge/route system that connects any main repository with its associated repositories for unified development workflow management

## Repository Bridge System

The new Repository Bridge System provides a flexible, configurable way to connect and manage any main repository with its associated repositories. This addresses the need for a universal bridge that can connect all branches of a main repository to handle development workflows across multiple repositories.

### Key Features
- **Universal Repository Bridge**: Works with any GitHub repository as the orchestration hub
- **Dynamic Organization Support**: Automatically adapts to different GitHub organizations/users  
- **Cross-Repository Routing**: Connects and manages branches across multiple related repositories
- **Type-Based Organization**: Categorize repositories by type (service, dependency, module, etc.)
- **Configuration-Driven Management**: Simple JSON configuration with CLI tools

### Quick Start

```bash
# Initialize a repository bridge
npm run bridge:init -- --main-repo "your-org/main-repo" --org "your-org"

# Add connected repositories
npm run bridge:config -- --add-repo "your-org/service1:service"
npm run bridge:config -- --add-repo "your-org/library1:dependency"

# Manage branches across all bridge repositories
npm run bridge:list          # List branches
npm run bridge:dry-run       # Preview cleanup
npm run bridge:cleanup       # Clean up old branches
```

See [Repository Bridge System Documentation](docs/REPOSITORY_BRIDGE_SYSTEM.md) for complete details.

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
