# Scanner Notes

- The repository intentionally uses CommonJS for Node scripts (e.g., `scripts/*.js`).
- VS Code may show a hint: "File is a CommonJS module; it may be converted to an ES module". This is informational and safe to ignore.
- To suppress noisy JS type-checking in plain `.js` files, `jsconfig.json` sets `checkJs: false`.
- Formatting: Prettier is the default formatter for JS/TS/JSON/Markdown via workspace settings.
- Secrets: Do not commit API keys to `.vscode/settings.json`. Prefer user-level environment variables or a secrets manager.
