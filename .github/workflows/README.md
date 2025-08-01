# GitHub Actions Workflows - Artifact V4 Compatibility

This directory contains GitHub Actions workflows that have been updated to use `actions/upload-artifact@v4` and `actions/download-artifact@v4`, replacing any previous versions (v2/v3).

## Workflows Overview

### 1. `ci.yml` - CI/CD Pipeline
- **Purpose:** Build and test all packages in the monorepo
- **Artifact Usage:** Shares build artifacts between jobs, uploads test results
- **V4 Compatibility:** ✅ Uses unique artifact names per matrix job with commit SHA

### 2. `release.yml` - Release Pipeline  
- **Purpose:** Build platform-specific release packages
- **Artifact Usage:** Creates platform-specific builds, consolidates for release
- **V4 Compatibility:** ✅ Uses unique names per platform target

### 3. `security.yml` - Security Scanning
- **Purpose:** Vulnerability scanning and license compliance
- **Artifact Usage:** Collects scan results, generates consolidated reports
- **V4 Compatibility:** ✅ Unique names per package scan

### 4. `performance.yml` - Performance Testing
- **Purpose:** Performance tests and benchmarking
- **Artifact Usage:** Stores performance metrics and benchmark results
- **V4 Compatibility:** ✅ Component-specific artifact names

### 5. `codeql.yml` - Code Scanning
- **Purpose:** CodeQL security analysis
- **Artifact Usage:** None (updated with v4 compatibility notes)
- **V4 Compatibility:** ✅ Documented for future use

### 6. `artifact-v4-test.yml` - V4 Compatibility Test
- **Purpose:** Demonstrates and tests v4 compatibility
- **Artifact Usage:** Creates test artifacts to verify v4 behavior
- **V4 Compatibility:** ✅ Full demonstration of v4 features

## GitHub Actions Artifact V4 Key Changes

### 🔄 Breaking Changes from V3 to V4

1. **Immutable Artifacts:** V4 artifacts cannot be overwritten once uploaded
2. **Unique Names Required:** Each artifact must have a globally unique name
3. **No Pattern Matching:** Downloads must specify exact artifact names
4. **Matrix Job Conflicts:** Non-unique names in matrix jobs will fail

### ✅ V4 Compatibility Requirements Met

All workflows in this repository follow these v4 best practices:

#### 1. Unique Artifact Names
```yaml
# ✅ CORRECT: Unique names using matrix variables and commit SHA
name: build-artifacts-${{ matrix.package }}-${{ github.sha }}

# ❌ WRONG: Same name across matrix jobs
name: build-artifacts
```

#### 2. Exact Downloads
```yaml
# ✅ CORRECT: Exact artifact name
- uses: actions/download-artifact@v4
  with:
    name: build-artifacts-core-abc123

# ❌ WRONG: Pattern matching (not supported in v4)
- uses: actions/download-artifact@v4
  with:
    name: "build-artifacts-*"
```

#### 3. Updated Action Versions
```yaml
# ✅ CORRECT: Using v4
- uses: actions/upload-artifact@v4
- uses: actions/download-artifact@v4

# ❌ WRONG: Deprecated versions
- uses: actions/upload-artifact@v3  # DEPRECATED
- uses: actions/download-artifact@v2  # DEPRECATED
```

### 🔍 V4 Compatibility Comments

Throughout the workflows, you'll find comments highlighting v4 compatibility:

```yaml
# ARTIFACT V4 COMPATIBILITY NOTE:
# v4 requires unique artifact names across all jobs and does not allow overwriting
# Using matrix.package in artifact name ensures uniqueness per package build
```

These comments identify:
- Where unique artifact names are required
- Locations where old v3 logic would break in v4
- Best practices for v4 compatibility

## Migration from V3 to V4

### What Was Changed

1. **Action Versions:** All `@v3` and `@v2` artifact actions updated to `@v4`
2. **Artifact Names:** Added commit SHA and matrix variables for uniqueness
3. **Download Strategy:** Changed from pattern-based to exact name downloads
4. **Error Handling:** Added `if-no-files-found` parameters for better error handling

### Areas That Required Review

- **Matrix Jobs:** Added unique identifiers to prevent name conflicts
- **Multi-Job Workflows:** Ensured artifact names are consistent between upload/download
- **Retention Policies:** Set appropriate retention days for different artifact types
- **Error Scenarios:** Added fallback handling for missing artifacts

## Testing V4 Compatibility

Run the artifact compatibility test workflow:

```bash
# Trigger the test workflow
gh workflow run artifact-v4-test.yml
```

This workflow creates test artifacts with unique names and verifies downloads work correctly with v4.

## Troubleshooting V4 Issues

### Common V4 Errors and Solutions

1. **"Artifact name already exists"**
   - **Cause:** Non-unique artifact names in concurrent jobs
   - **Solution:** Add commit SHA or unique identifiers to names

2. **"Artifact not found"**
   - **Cause:** Exact name mismatch between upload and download
   - **Solution:** Verify artifact names match exactly (no pattern matching)

3. **"Cannot overwrite artifact"**
   - **Cause:** Attempting to upload with same name as existing artifact
   - **Solution:** Use unique names or clean up old artifacts

### Debug Artifact Names

Add debugging steps to verify artifact names:

```yaml
- name: Debug artifact name
  run: echo "Artifact name will be: my-artifact-${{ matrix.component }}-${{ github.sha }}"
```

## Future Considerations

- **Artifact Cleanup:** Consider implementing cleanup workflows for old artifacts
- **Size Optimization:** Monitor artifact sizes and implement compression if needed
- **Retention Policies:** Review retention days based on actual usage patterns
- **Cross-Workflow Artifacts:** Plan naming conventions for artifacts shared between workflows

---

For more information about GitHub Actions Artifacts V4, see the [official documentation](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts).