#!/bin/bash

# 🏴‍☠️ Cpt. Guthilda's CSS4 Issue Monitor
# "Prevents CSS4 hardcoded nightmares from returning!"

echo "🏴‍☠️ CSS4 Issue Monitor - Checking for returning problems..."

MONITOR_DIR="/workspaces/Restructure-MCP-Orchestration/packages/monitor"
ISSUES_FOUND=0

# Check for CSS4 hardcoded patterns that tend to come back
check_css4_issues() {
    local file="$1"
    local issues=""
    
    # Check for problematic CSS4 patterns
    if grep -q "color(display-p3" "$file" 2>/dev/null; then
        issues+="❌ CSS4 color(display-p3) hardcoded function found\n"
        ((ISSUES_FOUND++))
    fi
    
    if grep -q "@layer" "$file" 2>/dev/null; then
        issues+="❌ CSS4 @layer hardcoded rules found\n"
        ((ISSUES_FOUND++))
    fi
    
    if grep -q "container-type:" "$file" 2>/dev/null; then
        issues+="❌ CSS4 container queries hardcoded\n"
        ((ISSUES_FOUND++))
    fi
    
    if grep -q "accent-color:" "$file" 2>/dev/null; then
        issues+="❌ CSS4 accent-color hardcoded\n"
        ((ISSUES_FOUND++))
    fi
    
    if [[ -n "$issues" ]]; then
        echo "🔍 Issues in $file:"
        echo -e "$issues"
    fi
}

# Check CSS files
echo "📁 Checking CSS files..."
find "$MONITOR_DIR" -name "*.css" -type f | while read -r file; do
    check_css4_issues "$file"
done

# Check config files
echo "⚙️ Checking config files..."
for config in "$MONITOR_DIR/postcss.config.js" "$MONITOR_DIR/tailwind.config.ts"; do
    if [[ -f "$config" ]]; then
        check_css4_issues "$config"
    fi
done

if [[ $ISSUES_FOUND -eq 0 ]]; then
    echo "✅ No CSS4 hardcoded issues detected!"
    echo "🏴‍☠️ Your CSS4 fix is still holding strong!"
else
    echo "⚠️ Found $ISSUES_FOUND CSS4 issues that came back"
    echo "💡 Run 'pnpm css4:fix' to resolve them again"
fi

echo ""
echo "🔄 Monitoring complete. CSS4 standards may evolve - stay vigilant!"
