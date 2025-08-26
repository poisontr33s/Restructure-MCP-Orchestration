applyTo: "/packages/servers/\*\*"

Servers rules

- Each server stays self-contained; reuse shared types and logger.
- Provide a `package.json` script to start the server.
- Keep network calls resilient with timeouts and retries.
