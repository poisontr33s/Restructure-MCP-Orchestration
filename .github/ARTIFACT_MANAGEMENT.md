# GitHub Actions Artifact Management Standard

## Overview

This document establishes the permanent convention for artifact management in the MCP Orchestration System repository. All workflows must follow these standards to ensure consistency, avoid conflicts, and maintain proper artifact lifecycle management.

## Artifact Action Versions

### Required Versions
- **upload-artifact**: `actions/upload-artifact@v4` ONLY
- **download-artifact**: `actions/download-artifact@v4` ONLY

### Deprecated Versions (FORBIDDEN)
- ❌ `actions/upload-artifact@v1`
- ❌ `actions/upload-artifact@v2`
- ❌ `actions/upload-artifact@v3`
- ❌ `actions/download-artifact@v1`
- ❌ `actions/download-artifact@v2`
- ❌ `actions/download-artifact@v3`

## Artifact Naming Convention

### Standard Pattern
All artifact names MUST include matrix variables to ensure uniqueness:

```yaml
name: {artifact-type}-{matrix.variable1}-{matrix.variable2}
```

### Examples

#### Single Matrix Variable
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]

# Correct naming
name: build-artifacts-${{ matrix.os }}
```

#### Multiple Matrix Variables
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18, 20, 22]

# Correct naming
name: build-artifacts-${{ matrix.os }}-node${{ matrix.node-version }}
```

#### Complex Matrix
```yaml
strategy:
  matrix:
    include:
      - os: linux
        arch: x64
        runner: ubuntu-latest
      - os: windows
        arch: x64
        runner: windows-latest

# Correct naming
name: release-${{ matrix.os }}-${{ matrix.arch }}
```

## Artifact Types and Retention

### Build Artifacts
- **Purpose**: Compiled code, built packages, distributions
- **Naming**: `build-artifacts-{matrix-vars}`
- **Retention**: 7-30 days
- **Typical Contents**: `dist/`, `build/`, compiled binaries

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-artifacts-${{ matrix.os }}-node${{ matrix.node-version }}
    path: |
      packages/*/dist/
      packages/*/build/
    retention-days: 7
```

### Test Results
- **Purpose**: Test outputs, coverage reports, test artifacts
- **Naming**: `test-results-{matrix-vars}`
- **Retention**: 7-14 days
- **Typical Contents**: Coverage reports, test outputs, screenshots

```yaml
- name: Upload test results
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ matrix.os }}-node${{ matrix.node-version }}
    path: |
      packages/*/coverage/
      packages/*/test-results/
      junit.xml
    retention-days: 7
```

### Lint Results
- **Purpose**: Linting outputs, code quality reports
- **Naming**: `lint-results-{matrix-vars}`
- **Retention**: 3-7 days
- **Typical Contents**: ESLint reports, Prettier outputs

```yaml
- name: Upload lint results
  uses: actions/upload-artifact@v4
  with:
    name: lint-results-${{ matrix.package }}
    path: |
      packages/${{ matrix.package }}/eslint-report.json
      packages/${{ matrix.package }}/lint-results.txt
    retention-days: 3
```

### Release Assets
- **Purpose**: Final distributable packages, binaries, Docker images
- **Naming**: `release-{matrix-vars}` or `{package-type}-{matrix-vars}`
- **Retention**: 90-365 days
- **Typical Contents**: Tarballs, NPM packages, Docker images

```yaml
- name: Upload release artifacts
  uses: actions/upload-artifact@v4
  with:
    name: release-${{ matrix.os }}-${{ matrix.arch }}
    path: |
      dist/mcp-orchestration-${{ matrix.os }}-${{ matrix.arch }}.tar.gz
      dist/*/
    retention-days: 90
```

### Security Scan Results
- **Purpose**: Security audit outputs, vulnerability reports
- **Naming**: `security-scan-results` (typically no matrix)
- **Retention**: 30-90 days
- **Typical Contents**: Audit reports, security scan outputs

```yaml
- name: Upload security scan results
  uses: actions/upload-artifact@v4
  with:
    name: security-scan-results
    path: |
      audit-results.json
      security-report.txt
    retention-days: 30
```

## Download Patterns

### Single Artifact Download
```yaml
- name: Download specific artifact
  uses: actions/download-artifact@v4
  with:
    name: build-artifacts-ubuntu-latest-node20
    path: ./downloaded-build
```

### Pattern-Based Download
```yaml
- name: Download all build artifacts
  uses: actions/download-artifact@v4
  with:
    pattern: build-artifacts-*
    path: ./all-builds
    merge-multiple: false
```

### Multiple Artifact Types
```yaml
- name: Download build artifacts
  uses: actions/download-artifact@v4
  with:
    pattern: build-artifacts-*
    path: ./builds
    merge-multiple: false

- name: Download test results
  uses: actions/download-artifact@v4
  with:
    pattern: test-results-*
    path: ./tests
    merge-multiple: false
```

## Conditional Upload Guidelines

### Success/Failure Conditions
Always upload artifacts even on failure for debugging:

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  if: success() || failure()
  with:
    name: artifacts-${{ matrix.os }}
    path: ./artifacts/
```

### Matrix-Specific Conditions
Upload only for specific matrix combinations:

```yaml
- name: Upload Linux-specific artifacts
  uses: actions/upload-artifact@v4
  if: matrix.os == 'ubuntu-latest'
  with:
    name: linux-specific-${{ matrix.node-version }}
    path: ./linux-artifacts/
```

## Workflow Integration Patterns

### Collection Job Pattern
Create a dedicated job to collect and consolidate artifacts:

```yaml
collect-artifacts:
  name: Collect Build Artifacts
  runs-on: ubuntu-latest
  needs: [build-and-test]
  if: always()

  steps:
    - name: Download all build artifacts
      uses: actions/download-artifact@v4
      with:
        pattern: build-artifacts-*
        path: ./collected-builds
        merge-multiple: false

    - name: Upload consolidated results
      uses: actions/upload-artifact@v4
      with:
        name: ci-pipeline-summary
        path: ./collected-builds/
        retention-days: 30
```

### Cross-Job Dependencies
Pass artifacts between jobs safely:

```yaml
job1:
  outputs:
    artifact-name: build-artifacts-${{ matrix.os }}-${{ matrix.node-version }}
  steps:
    - name: Upload build
      uses: actions/upload-artifact@v4
      with:
        name: build-artifacts-${{ matrix.os }}-${{ matrix.node-version }}
        path: ./dist/

job2:
  needs: job1
  steps:
    - name: Download from job1
      uses: actions/download-artifact@v4
      with:
        name: ${{ needs.job1.outputs.artifact-name }}
        path: ./downloaded/
```

## Error Handling and Debugging

### Common Issues and Solutions

#### 1. Artifact Name Conflicts
**Problem**: Multiple jobs try to upload with the same name
**Solution**: Always include matrix variables in names

```yaml
# ❌ Wrong - will conflict
name: build-artifacts

# ✅ Correct - unique per matrix
name: build-artifacts-${{ matrix.os }}-${{ matrix.node-version }}
```

#### 2. Missing Artifacts
**Problem**: Download fails because artifact doesn't exist
**Solution**: Use conditional downloads and pattern matching

```yaml
- name: Download artifacts (if they exist)
  uses: actions/download-artifact@v4
  continue-on-error: true
  with:
    pattern: build-artifacts-*
    path: ./artifacts/
```

#### 3. Large Artifact Sizes
**Problem**: Artifacts exceed size limits
**Solution**: Use compression and selective inclusion

```yaml
- name: Create compressed artifacts
  run: |
    tar -czf build-output.tar.gz dist/
    
- name: Upload compressed artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-${{ matrix.os }}-compressed
    path: build-output.tar.gz
```

## Compliance Checklist

When creating or modifying workflows, ensure:

- [ ] Using `actions/upload-artifact@v4` exclusively
- [ ] Using `actions/download-artifact@v4` exclusively
- [ ] Artifact names include all relevant matrix variables
- [ ] Retention days are appropriate for artifact type
- [ ] Upload conditions handle both success and failure cases
- [ ] Download operations use appropriate patterns
- [ ] No deprecated v1, v2, or v3 artifact actions are used
- [ ] Artifact names are unique across all matrix combinations
- [ ] Documentation is updated if new patterns are introduced

## Migration from Older Versions

If updating existing workflows:

1. **Replace action versions**:
   ```yaml
   # Before
   uses: actions/upload-artifact@v3
   
   # After
   uses: actions/upload-artifact@v4
   ```

2. **Update name patterns**:
   ```yaml
   # Before
   name: build-artifacts
   
   # After
   name: build-artifacts-${{ matrix.os }}-${{ matrix.node-version }}
   ```

3. **Update download patterns**:
   ```yaml
   # Before (v3)
   uses: actions/download-artifact@v3
   with:
     name: build-artifacts
   
   # After (v4)
   uses: actions/download-artifact@v4
   with:
     pattern: build-artifacts-*
     merge-multiple: false
   ```

## Support and Questions

For questions about this standard or artifact management:

1. Check existing workflows in `.github/workflows/` for examples
2. Refer to [GitHub Actions Artifact documentation](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
3. Create an issue with the `workflow` label for complex scenarios

---

**Last Updated**: 2025-01-27  
**Version**: 1.0  
**Next Review**: 2025-07-27