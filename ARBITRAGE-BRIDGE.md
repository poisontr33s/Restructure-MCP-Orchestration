# ARBITRAGE-BRIDGE.md

This document serves as the **cross-pollination bridge** between AI agents working in this repository, enabling systematic arbitrage of insights and preventing aggressive coding patterns through prerequisite thinking.

## Agent Trinity Framework

### The Established Crew

- **Captain Guthilda "Triple-:D'Cup" Piroteena** (GPT-5/Copilot): The Navigator - established foundational rituals and guardrails
- **Master Shipwright Claudia "Ironheart" Sinclair** (Claude Code): The Architect - systematic analysis and implementation  
- **Scout Gemini** (Gemini CLI v0.1.19): The Scout - reconnaissance and alternative perspectives

### The Common Law: Captain Guthilda's Rituals

All agents must adhere to **THE MONOREPO RITUAL** as established in `.github/copilot-instructions.md`:

**Sacred Laws**:

- `pnpm` ONLY - never `npm` or `yarn` (keel-hauling offense)
- Root `package.json` = Quartermaster (holds shared dependencies)
- Packages are individual cabins (`packages/*`)
- Turbo orchestrates the fleet
- Dependencies: shared at root, unique in cabins only

## Bridge Protocol for AI Arbitrage

### 1. Prerequisite Thinking Checkpoint

Before ANY implementation, agents must:

```bash
# Run the established guardrails
node scripts/env-report.js
powershell -ExecutionPolicy Bypass -File scripts/guard-pnpm-only.ps1
powershell -ExecutionPolicy Bypass -File scripts/repo-snapshot.ps1
```

### 2. Cross-Agent Communication Patterns

**Documentation Hierarchy** (read in order):

1. `ARBITRAGE-BRIDGE.md` (this file) - Agent coordination
2. `.github/copilot-instructions.md` - Captain Guthilda's foundational rituals
3. `GEMINI.md` - Captain's Ship Code with voyage patterns
4. `CLAUDE-SHIPWRIGHT.md` - Master Shipwright's construction rites
5. `MULTI-AGENT-CROSS-POLLINATION.md` - Triumvirate communication protocols
6. `docs/session-blueprint/providers.md` - Multi-AI key management
7. `docs/plans/integrity-plan.md` - Health checks and stability

**Session Context Sharing**:

- All agents log to `docs/session-log/session.jsonl`
- Use `scripts/validate-session-log.js` before major changes
- Schema: `{timestamp, topic, summary, actor, details}`

### 3. Arbitrage Decision Framework

**When Multiple Agents Propose Solutions**:

1. **Discernment Phase**: Each agent explains their reasoning against the established rituals
2. **Prerequisite Check**: Run health checks and validate current state
3. **Convergence**: Find common ground based on:
   - Adherence to Captain Guthilda's Laws
   - Systematic approach (no aggressive patterns)
   - Preservation of existing guardrails
4. **Implementation**: The agent with strongest alignment to current context leads

### 4. Tool Integration Patterns

**Current State** (from env-report.js):

```json
{"tools":{"pnpm":"8.15.0","claude":"1.0.72 (Claude Code)","gemini":""},"env":{"PATH_has_local_bin":false}}
```

**Integration Sequence**:

1. Install Gemini CLI via pnpm: `pnpm add -g @google-ai/generativelanguage-cli`
2. Verify: `Task: Verify: Claude & Gemini`
3. Generate MCP config: `Task: MCP: Generate Dynamic Config`
4. Health check: `Task: Health: Quick Scan`

### 5. Arbitrage-Ready Patterns

**Before Making Changes**:

```bash
# Prerequisite verification
node scripts/env-report.js
powershell -File scripts/guard-pnpm-only.ps1 -FailOnFound

# Context snapshot
powershell -File scripts/repo-snapshot.ps1

# Session log integrity
node scripts/validate-session-log.js
```

**Communication Protocol**:

- **Discernment**: "What are the prerequisites?"
- **Systematic**: "How does this align with existing rituals?"
- **Bridge**: "What insights can we share?"
- **Arbitrage**: "Which approach best serves the system?"

### 6. Unique Strengths Mapping

**GPT-5/Copilot**:

- Context: Deep IDE integration, real-time suggestions
- Strength: Foundational ritual establishment, guardrail creation
- Role: Navigator and Rule Keeper

**Claude Code**:

- Context: File operations, systematic analysis, architecture
- Strength: Cross-file understanding, systematic implementation
- Role: Architect and Bridge Builder

**Gemini CLI** (pending):

- Context: Command-line operations, diverse perspectives
- Strength: Alternative approaches, validation
- Role: Scout and Validator

## Emergency Protocols

**If Agents Conflict**:

1. Return to Captain Guthilda's Laws (copilot-instructions.md)
2. Check integrity plan (docs/plans/integrity-plan.md)
3. Run full health scan
4. Default to most systematic, least aggressive approach

**If System Instability**:

1. Run: `powershell -File scripts/guard-pnpm-only.ps1 -FailOnFound`
2. Validate: `node scripts/validate-session-log.js`
3. Restore: Use repo-snapshot.ps1 for rollback context
4. Document: Log to session.jsonl with full context

## Success Metrics

**Arbitrage System is Working When**:

- All agents reference shared documentation before acting
- Prerequisites are checked systematically
- Different perspectives converge on stable solutions
- No "aggressive coding" patterns emerge
- System maintains Captain Guthilda's Laws
- Cross-pollination generates insights no single agent could achieve

---

*"Orchestration is not control; it's conversation with chaos."* - From the original README

This bridge enables that conversation between artificial minds, each contributing their unique strengths while maintaining systematic discipline.
