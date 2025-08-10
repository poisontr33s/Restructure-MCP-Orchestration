# Session Journal (JSONL)

This is a lightweight, append-only session journal designed for a prompt engineer’s workflow.

- Format: JSON Lines (one JSON object per line)
- Location: `docs/session-log/session.jsonl`
- Purpose: capture high-level intent, context, environment, and actions.

## Entry shape

Each line is a JSON object:

```json
{
  "ts": "ISO-8601 timestamp",
  "actor": "human|agent|system",
  "topic": "short category",
  "summary": "1-2 sentences",
  "details": { "free": "structured/notes" },
  "env": { "branch": "...", "os": "...", "shell": "..." }
}
```

## Usage

- Use the provided PowerShell append script to add entries programmatically.
- You can also paste from clipboard via the VS Code task.
- Keep it simple: one line per thought/action.
