/**
 * Tests for .github configuration files added/changed in PR:
 * - .github/gemini-code-assist.yml (new)
 * - .github/ISSUE_TEMPLATE/bug_report.md (new)
 * - .github/ISSUE_TEMPLATE/feature_request.md (new)
 * - .github/dependabot.yml (renamed from .disabled)
 * - .github/copilot-instructions.md (renamed from .off.md)
 * - .github/guthilda-monorepo-notes.md (formatting fix)
 * - .github/guthilda-monorepo-rituals.md (formatting fix)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeAll } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Resolve monorepo root from packages/shared/test/
const REPO_ROOT = resolve(__dirname, '../../..');
const GITHUB_DIR = resolve(REPO_ROOT, '.github');

// Helper: read a file relative to .github/
function readGithubFile(relativePath: string): string {
  const fullPath = resolve(GITHUB_DIR, relativePath);
  return readFileSync(fullPath, 'utf-8');
}

// Helper: check if a .github file exists
function githubFileExists(relativePath: string): boolean {
  return existsSync(resolve(GITHUB_DIR, relativePath));
}

// Helper: extract top-level YAML keys (lines not starting with whitespace that contain ":")
function getTopLevelYamlKeys(content: string): string[] {
  return content
    .split('\n')
    .filter((line) => /^[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(line))
    .map((line) => line.split(':')[0].trim());
}

// Helper: parse YAML front matter from a Markdown file (between first pair of "---" delimiters)
function parseMarkdownFrontMatter(content: string): Record<string, string> {
  const lines = content.split('\n');
  if (lines[0].trim() !== '---') return {};
  const endIndex = lines.indexOf('---', 1);
  if (endIndex === -1) return {};
  const frontMatterLines = lines.slice(1, endIndex);
  const result: Record<string, string> = {};
  for (const line of frontMatterLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

// Helper: extract Markdown section headings (lines starting with ##)
function getMarkdownSections(content: string): string[] {
  return content
    .split('\n')
    .filter((line) => /^#{1,6}\s/.test(line))
    .map((line) => line.replace(/^#+\s+/, '').trim());
}

// ---------------------------------------------------------------------------
// gemini-code-assist.yml
// ---------------------------------------------------------------------------
describe('gemini-code-assist.yml', () => {
  let content: string;

  beforeAll(() => {
    content = readGithubFile('gemini-code-assist.yml');
  });

  it('exists in the .github directory', () => {
    expect(githubFileExists('gemini-code-assist.yml')).toBe(true);
  });

  it('has gemini_code_assist as the top-level key', () => {
    const keys = getTopLevelYamlKeys(content);
    expect(keys).toContain('gemini_code_assist');
  });

  it('has enabled: true', () => {
    expect(content).toMatch(/^\s+enabled:\s+true/m);
  });

  it('declares all expected feature flags', () => {
    const featureFlags = [
      'code_completion',
      'code_generation',
      'code_review_assistance',
      'documentation_generation',
      'bug_detection',
      'performance_optimization',
      'security_analysis',
    ];
    for (const flag of featureFlags) {
      expect(content, `Expected feature flag "${flag}" to be present`).toContain(`${flag}:`);
    }
  });

  it('sets all feature flags to true', () => {
    const featureFlags = [
      'code_completion',
      'code_generation',
      'code_review_assistance',
      'documentation_generation',
      'bug_detection',
      'performance_optimization',
      'security_analysis',
    ];
    for (const flag of featureFlags) {
      expect(content, `Expected "${flag}: true"`).toMatch(
        new RegExp(`${flag}:\\s+true`),
      );
    }
  });

  it('lists TypeScript as a primary language', () => {
    expect(content).toContain('"TypeScript"');
  });

  it('lists JavaScript as a primary language', () => {
    expect(content).toContain('"JavaScript"');
  });

  it('specifies pnpm_monorepo as workspace_type', () => {
    expect(content).toMatch(/workspace_type:\s+"pnpm_monorepo"/);
  });

  it('specifies packages/ as the packages_directory', () => {
    expect(content).toMatch(/packages_directory:\s+"packages\/"/);
  });

  it('specifies vitest as the testing framework', () => {
    expect(content).toMatch(/framework:\s+"vitest"/);
  });

  it('includes github_integration section', () => {
    expect(content).toContain('github_integration:');
  });

  it('enables auto_review for pull requests', () => {
    expect(content).toMatch(/auto_review:\s+true/);
  });

  it('includes exclude_patterns to skip generated directories', () => {
    expect(content).toContain('exclude_patterns:');
    expect(content).toContain('node_modules/');
    expect(content).toContain('dist/');
    expect(content).toContain('build/');
  });

  it('excludes environment files from analysis', () => {
    expect(content).toContain('.env*');
  });

  it('excludes lockfiles from analysis', () => {
    expect(content).toContain('pnpm-lock.yaml');
    expect(content).toContain('package-lock.json');
  });

  it('includes related_repositories section', () => {
    expect(content).toContain('related_repositories:');
  });

  it('includes security considerations for the project', () => {
    expect(content).toContain('security:');
    expect(content).toContain('Never hardcode API keys or sensitive data');
  });

  it('does not hardcode any API key values', () => {
    // Should not contain patterns like key = "value" with real-looking keys
    expect(content).not.toMatch(/api_key\s*:\s*"[a-zA-Z0-9_\-]{20,}"/i);
    expect(content).not.toMatch(/secret\s*:\s*"[a-zA-Z0-9_\-]{20,}"/i);
  });

  it('uses Node.js in the frameworks list', () => {
    expect(content).toContain('"Node.js"');
  });

  it('includes pnpm in the frameworks list', () => {
    expect(content).toContain('"pnpm"');
  });

  it('has code_style preferences favoring TypeScript', () => {
    expect(content).toMatch(/prefer_typescript:\s+true/);
  });

  it('has code_style preferences for async/await', () => {
    expect(content).toMatch(/prefer_async_await:\s+true/);
  });
});

// ---------------------------------------------------------------------------
// ISSUE_TEMPLATE/bug_report.md
// ---------------------------------------------------------------------------
describe('ISSUE_TEMPLATE/bug_report.md', () => {
  let content: string;
  let frontMatter: Record<string, string>;

  beforeAll(() => {
    content = readGithubFile('ISSUE_TEMPLATE/bug_report.md');
    frontMatter = parseMarkdownFrontMatter(content);
  });

  it('exists in the ISSUE_TEMPLATE directory', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/bug_report.md')).toBe(true);
  });

  it('has YAML front matter delimited by ---', () => {
    const lines = content.split('\n');
    expect(lines[0].trim()).toBe('---');
    const endIdx = lines.indexOf('---', 1);
    expect(endIdx).toBeGreaterThan(0);
  });

  it('front matter contains a name field', () => {
    expect(frontMatter).toHaveProperty('name');
    expect(frontMatter['name']).toBeTruthy();
  });

  it('front matter name is "Bug report"', () => {
    expect(frontMatter['name']).toBe('Bug report');
  });

  it('front matter contains an about field', () => {
    expect(frontMatter).toHaveProperty('about');
    expect(frontMatter['about']).toBeTruthy();
  });

  it('front matter has a title field', () => {
    expect(frontMatter).toHaveProperty('title');
  });

  it('front matter has a labels field', () => {
    expect(frontMatter).toHaveProperty('labels');
  });

  it('front matter has an assignees field', () => {
    expect(frontMatter).toHaveProperty('assignees');
  });

  it('contains a "Describe the bug" section', () => {
    expect(content).toContain('**Describe the bug**');
  });

  it('contains a "To Reproduce" section', () => {
    expect(content).toContain('**To Reproduce**');
  });

  it('contains steps to reproduce', () => {
    expect(content).toMatch(/\d+\.\s+.+/);
  });

  it('contains an "Expected behavior" section', () => {
    expect(content).toContain('**Expected behavior**');
  });

  it('contains a "Screenshots" section', () => {
    expect(content).toContain('**Screenshots**');
  });

  it('contains desktop environment information section', () => {
    expect(content).toContain('**Desktop');
    expect(content).toContain('- OS:');
    expect(content).toContain('- Browser');
    expect(content).toContain('- Version');
  });

  it('contains smartphone environment information section', () => {
    expect(content).toContain('**Smartphone');
    expect(content).toContain('- Device:');
  });

  it('contains an "Additional context" section', () => {
    expect(content).toContain('**Additional context**');
  });

  it('is non-empty with meaningful content', () => {
    // Remove front matter and check there's still body content
    const bodyStart = content.indexOf('---', 3) + 3;
    const body = content.slice(bodyStart).trim();
    expect(body.length).toBeGreaterThan(100);
  });

  it('does not contain old YAML template fields (labels: ["type:bug"])', () => {
    // The old bug.yml had automatic label assignment; new template should not
    expect(content).not.toContain('labels: ["type:bug"');
  });
});

// ---------------------------------------------------------------------------
// ISSUE_TEMPLATE/feature_request.md
// ---------------------------------------------------------------------------
describe('ISSUE_TEMPLATE/feature_request.md', () => {
  let content: string;
  let frontMatter: Record<string, string>;

  beforeAll(() => {
    content = readGithubFile('ISSUE_TEMPLATE/feature_request.md');
    frontMatter = parseMarkdownFrontMatter(content);
  });

  it('exists in the ISSUE_TEMPLATE directory', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/feature_request.md')).toBe(true);
  });

  it('has YAML front matter delimited by ---', () => {
    const lines = content.split('\n');
    expect(lines[0].trim()).toBe('---');
    const endIdx = lines.indexOf('---', 1);
    expect(endIdx).toBeGreaterThan(0);
  });

  it('front matter name is "Feature request"', () => {
    expect(frontMatter['name']).toBe('Feature request');
  });

  it('front matter contains an about field describing suggestions', () => {
    expect(frontMatter['about']).toBeTruthy();
    expect(frontMatter['about'].toLowerCase()).toContain('idea');
  });

  it('front matter has title, labels, and assignees fields', () => {
    expect(frontMatter).toHaveProperty('title');
    expect(frontMatter).toHaveProperty('labels');
    expect(frontMatter).toHaveProperty('assignees');
  });

  it('contains a problem description section', () => {
    expect(content).toContain('Is your feature request related to a problem');
  });

  it('contains a solution description section', () => {
    expect(content).toContain('Describe the solution you');
  });

  it('contains an alternatives section', () => {
    expect(content).toContain('Describe alternatives you');
  });

  it('contains an additional context section', () => {
    expect(content).toContain('**Additional context**');
  });

  it('is non-empty with meaningful content', () => {
    const bodyStart = content.indexOf('---', 3) + 3;
    const body = content.slice(bodyStart).trim();
    expect(body.length).toBeGreaterThan(50);
  });
});

// ---------------------------------------------------------------------------
// dependabot.yml
// ---------------------------------------------------------------------------
describe('dependabot.yml', () => {
  let content: string;
  let lines: string[];

  beforeAll(() => {
    content = readGithubFile('dependabot.yml');
    lines = content.split('\n');
  });

  it('exists (renamed from dependabot.yml.disabled)', () => {
    expect(githubFileExists('dependabot.yml')).toBe(true);
  });

  it('disabled version no longer exists', () => {
    expect(githubFileExists('dependabot.yml.disabled')).toBe(false);
  });

  it('specifies version 2', () => {
    expect(content).toMatch(/^version:\s+2/m);
  });

  it('has an updates array', () => {
    expect(content).toContain('updates:');
  });

  it('configures npm ecosystem updates', () => {
    expect(content).toMatch(/package-ecosystem:\s+"npm"/);
  });

  it('includes a root package entry (directory: "/")', () => {
    expect(content).toContain('directory: "/"');
  });

  it('configures weekly update schedule', () => {
    const weeklyMatches = (content.match(/interval:\s+"weekly"/g) ?? []).length;
    expect(weeklyMatches).toBeGreaterThan(0);
  });

  it('covers all workspace packages', () => {
    const expectedDirectories = [
      '/packages/cli',
      '/packages/core',
      '/packages/monitor',
      '/packages/shared',
      '/packages/servers/base',
      '/packages/servers/duckduckgo',
      '/packages/servers/sequential-thinking',
      '/packages/guthilda',
    ];
    for (const dir of expectedDirectories) {
      expect(content, `Expected directory "${dir}" in dependabot.yml`).toContain(
        `directory: "${dir}"`,
      );
    }
  });

  it('has at least 9 update entries (root + 8 packages)', () => {
    const packageEcosystemCount = (content.match(/package-ecosystem:/g) ?? []).length;
    expect(packageEcosystemCount).toBeGreaterThanOrEqual(9);
  });

  it('specifies a pull request limit for the root package', () => {
    expect(content).toMatch(/open-pull-requests-limit:\s+10/);
  });

  it('does not have zero pull request limits', () => {
    // All limits should be positive numbers
    const limits = content.match(/open-pull-requests-limit:\s+(\d+)/g) ?? [];
    for (const limit of limits) {
      const num = parseInt(limit.replace(/\D+/g, ''), 10);
      expect(num, `Pull request limit should be positive, got ${num}`).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// copilot-instructions.md
// ---------------------------------------------------------------------------
describe('copilot-instructions.md', () => {
  let content: string;

  beforeAll(() => {
    content = readGithubFile('copilot-instructions.md');
  });

  it('exists (renamed from copilot-instructions.off.md)', () => {
    expect(githubFileExists('copilot-instructions.md')).toBe(true);
  });

  it('the .off.md version no longer exists', () => {
    expect(githubFileExists('copilot-instructions.off.md')).toBe(false);
  });

  it('is non-empty', () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('contains monorepo instructions', () => {
    expect(content.toLowerCase()).toContain('monorepo');
  });

  it('references pnpm as the package manager', () => {
    expect(content).toContain('pnpm');
  });

  it('contains package management guidance', () => {
    expect(content.toLowerCase()).toMatch(/package\.json|dependencies|devdependencies/i);
  });

  it('references the packages directory structure', () => {
    expect(content).toContain('packages/');
  });
});

// ---------------------------------------------------------------------------
// guthilda-monorepo-notes.md formatting fix
// ---------------------------------------------------------------------------
describe('guthilda-monorepo-notes.md', () => {
  let content: string;

  beforeAll(() => {
    content = readGithubFile('guthilda-monorepo-notes.md');
  });

  it('exists', () => {
    expect(githubFileExists('guthilda-monorepo-notes.md')).toBe(true);
  });

  it('no longer contains the old nested blockquote with extra > level', () => {
    // Old format was:  > > _...refer to copilot.instructions.md/._]
    // New format is:   > *...refer to copilot.instructions.md/.*]
    expect(content).not.toMatch(/^> > _\.\.\.refer to copilot\.instructions\.md/m);
  });

  it('contains the reference to copilot.instructions.md with correct formatting', () => {
    // New format uses * instead of _ for italics, and no double blockquote
    expect(content).toContain('*...refer to copilot.instructions.md/.*]');
  });

  it('does not use double blockquote nesting for the copilot reference', () => {
    const lines = content.split('\n');
    const copilotRefLines = lines.filter((line) => line.includes('refer to copilot.instructions.md'));
    expect(copilotRefLines.length).toBeGreaterThan(0);
    for (const line of copilotRefLines) {
      // Should start with single "> " not double "> > "
      expect(line).not.toMatch(/^> > /);
    }
  });

  it('is non-empty with substantial content', () => {
    expect(content.length).toBeGreaterThan(500);
  });
});

// ---------------------------------------------------------------------------
// guthilda-monorepo-rituals.md formatting fix
// ---------------------------------------------------------------------------
describe('guthilda-monorepo-rituals.md', () => {
  let content: string;
  let lines: string[];

  beforeAll(() => {
    content = readGithubFile('guthilda-monorepo-rituals.md');
    lines = content.split('\n');
  });

  it('exists', () => {
    expect(githubFileExists('guthilda-monorepo-rituals.md')).toBe(true);
  });

  it('does not have a blank line between "Meta-Orchestration Scripts:" and the code block', () => {
    // Find the line with "Meta-Orchestration Scripts:"
    const metaIdx = lines.findIndex((l) => l.includes('Meta-Orchestration Scripts:'));
    expect(metaIdx).toBeGreaterThan(-1);
    // The very next non-blank line should be the code block opening ```
    const nextCodeBlockIdx = lines.findIndex((l, i) => i > metaIdx && l.trim().startsWith('```'));
    // There should be no blank line between the label and the code block
    const linesBetween = lines.slice(metaIdx + 1, nextCodeBlockIdx);
    const blankLinesBetween = linesBetween.filter((l) => l.trim() === '');
    expect(blankLinesBetween.length).toBe(0);
  });

  it('contains the Captain Guthilda Command Structure section', () => {
    expect(content).toContain("## 8. Captain Guthilda's Command Structure");
  });

  it('contains the Meta-Commands section 12', () => {
    expect(content).toContain("## 12. Captain Guthilda's Meta-Commands");
  });

  it('does not have a blank line immediately after section 12 subsection headers', () => {
    // The PR removed blank lines between ### headers and their list content
    const subsectionHeaders = [
      'Authentication & Discovery',
      'Orchestration & Automation',
      'Monitoring & Maintenance',
    ];
    for (const header of subsectionHeaders) {
      const headerIdx = lines.findIndex((l) => l.includes(header));
      expect(headerIdx, `Header "${header}" not found`).toBeGreaterThan(-1);
      // The line immediately after the ### header should NOT be blank
      const lineAfterHeader = lines[headerIdx + 1];
      expect(
        lineAfterHeader.trim(),
        `Expected no blank line after "### ${header}" header`,
      ).not.toBe('');
    }
  });

  it('contains guthilda command references in section 8', () => {
    expect(content).toContain('pnpm guthilda:status');
    expect(content).toContain('pnpm guthilda:deploy');
  });

  it('contains meta-command references in section 12', () => {
    expect(content).toContain('guthilda auth setup');
    expect(content).toContain('guthilda orchestrate start');
    expect(content).toContain('guthilda status all');
  });

  it('is non-empty with substantial content', () => {
    expect(content.length).toBeGreaterThan(1000);
  });
});

// ---------------------------------------------------------------------------
// Deleted files should no longer exist
// ---------------------------------------------------------------------------
describe('deleted files no longer exist', () => {
  it('.coderabbit.yml has been removed', () => {
    expect(existsSync(resolve(REPO_ROOT, '.coderabbit.yml'))).toBe(false);
  });

  it('ISSUE_TEMPLATE/bug.yml has been removed', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/bug.yml')).toBe(false);
  });

  it('ISSUE_TEMPLATE/epic.yml has been removed', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/epic.yml')).toBe(false);
  });

  it('ISSUE_TEMPLATE/task.yml has been removed', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/task.yml')).toBe(false);
  });

  it('ISSUE_TEMPLATE/natural-language.yml has been removed', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/natural-language.yml')).toBe(false);
  });

  it('ISSUE_TEMPLATE/natural-language.md has been removed', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/natural-language.md')).toBe(false);
  });

  it('ISSUE_TEMPLATE/natural-language.nlp has been removed', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/natural-language.nlp')).toBe(false);
  });

  it('ISSUE_TEMPLATE/README.md has been removed', () => {
    expect(githubFileExists('ISSUE_TEMPLATE/README.md')).toBe(false);
  });

  it('PULL_REQUEST_TEMPLATE.md has been removed', () => {
    expect(githubFileExists('PULL_REQUEST_TEMPLATE.md')).toBe(false);
  });

  it('labeler.yml has been removed', () => {
    expect(githubFileExists('labeler.yml')).toBe(false);
  });

  it('labels.yml has been removed', () => {
    expect(githubFileExists('labels.yml')).toBe(false);
  });

  it('WORKFLOW_OPTIMIZATION_PROPOSAL.md has been removed', () => {
    expect(githubFileExists('WORKFLOW_OPTIMIZATION_PROPOSAL.md')).toBe(false);
  });

  it('archive/README.md has been removed', () => {
    expect(githubFileExists('archive/README.md')).toBe(false);
  });

  it('archive/proposals/GEMINI_LIBERATION_PROPOSAL.md has been removed', () => {
    expect(githubFileExists('archive/proposals/GEMINI_LIBERATION_PROPOSAL.md')).toBe(false);
  });

  it('archive/proposals/WORKFLOW_IMPROVEMENTS.md has been removed', () => {
    expect(githubFileExists('archive/proposals/WORKFLOW_IMPROVEMENTS.md')).toBe(false);
  });

  it('archive/proposals/agent-gemini-liberated.yml has been removed', () => {
    expect(githubFileExists('archive/proposals/agent-gemini-liberated.yml')).toBe(false);
  });

  it('workflows/agent-claude.yml.disabled has been removed', () => {
    expect(githubFileExists('workflows/agent-claude.yml.disabled')).toBe(false);
  });

  it('workflows/agent-codex.yml.disabled has been removed', () => {
    expect(githubFileExists('workflows/agent-codex.yml.disabled')).toBe(false);
  });
});
