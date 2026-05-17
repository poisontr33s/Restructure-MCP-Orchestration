# Security Patterns — MCP Orchestration

## PATTERN-001: GitHub Actions — Workflow Expression Injection (OWASP A03:2021)

**Issue:** #263 (filed 2026-03-29 by cicd-security)

### Vulnerable Pattern

Using `${{ expression }}` directly inside a shell `run:` block is a **prompt/expression injection vector**.

```yaml
# VULNERABLE — DO NOT USE
- name: Comment with AI summary
  run: |
    gh issue comment $ISSUE_NUMBER --body '${{ steps.inference.outputs.response }}'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ISSUE_NUMBER: ${{ github.event.issue.number }}
```

**Why:** If `steps.inference.outputs.response` contains a single quote `'`, it breaks out of the shell quoting context. If it contains shell metacharacters, arbitrary commands can be injected into the workflow runner environment.

### Fixed Pattern

Route all untrusted dynamic values through `env:` variables — never inline them into the shell command string.

```yaml
# SECURE — required pattern
- name: Comment with AI summary
  run: |
    gh issue comment "$ISSUE_NUMBER" --body "$RESPONSE"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ISSUE_NUMBER: ${{ github.event.issue.number }}
    RESPONSE: ${{ steps.inference.outputs.response }}
```

**Why it works:** `$RESPONSE` in the shell context is expanded by the shell from the environment — the `${{ ... }}` expression is never concatenated into the shell command string. The value is passed as a process environment variable, preventing any shell interpretation of its contents.

### Scope

This pattern applies to **all** GitHub Actions workflows that:
- Use AI inference outputs (`actions/ai-inference@v1` or similar)
- Use untrusted user inputs (`github.event.issue.title`, `github.event.issue.body`, `github.event.comment.body`, etc.)
- Use any LLM-generated text in shell commands

### Files Fixed

- `.github/workflows/summary.yml.disabled` — corrected body from `'${{ ... }}'` to `"$RESPONSE"` (env var already declared, ref was wrong)

### References

- [GitHub Actions security hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injections)
- [OWASP A03:2021 — Injection](https://owasp.org/Top10/A03_2021-Injection/)