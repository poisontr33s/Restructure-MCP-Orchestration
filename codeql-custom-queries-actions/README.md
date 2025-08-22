# CodeQL Actions Pack Setup

This folder contains a minimal CodeQL pack that uses the GitHub Actions library.

## One-time setup

1. Install the VS Code extension: "GitHub CodeQL" (recommended is in .vscode/extensions.json)
2. Let the extension download the CodeQL CLI automatically. You can check status from the CodeQL view.

## Install and compile this pack

- From the CodeQL view, open this folder as a CodeQL workspace or use the palette:
  - "CodeQL: Install Pack Dependencies"
  - "CodeQL: Compile Query/Pack"

Alternatively, if `codeql` is on PATH:

```pwsh
cd codeql-custom-queries-actions
codeql pack install
codeql pack compile .
```

## After that

- The query `example.ql` should resolve `import github.actions` and the `Workflow` type.
