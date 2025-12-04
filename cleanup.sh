#!/bin/bash

# Cleanup script to remove unnecessary node_modules and build artifacts
# This helps reduce repository size and ensures clean installations

echo "🧹 Cleaning up project dependencies and build artifacts..."
echo ""

# Remove all node_modules directories
echo "Removing node_modules directories..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "  ✓ Removed root node_modules"
fi

if [ -d "backend/node_modules" ]; then
    rm -rf backend/node_modules
    echo "  ✓ Removed backend/node_modules"
fi

if [ -d "client/node_modules" ]; then
    rm -rf client/node_modules
    echo "  ✓ Removed client/node_modules"
fi

# Remove build artifacts
echo ""
echo "Removing build artifacts..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✓ Removed root dist"
fi

if [ -d "client/dist" ]; then
    rm -rf client/dist
    echo "  ✓ Removed client/dist"
fi

# Remove package-lock.json files (optional - uncomment if you want to regenerate them)
# echo ""
# echo "Removing package-lock.json files..."
# if [ -f "package-lock.json" ]; then
#     rm package-lock.json
#     echo "  ✓ Removed root package-lock.json"
# fi
# if [ -f "backend/package-lock.json" ]; then
#     rm backend/package-lock.json
#     echo "  ✓ Removed backend/package-lock.json"
# fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "  1. Install backend dependencies: cd backend && npm install"
echo "  2. Install frontend dependencies: cd .. && npm install"
echo "  3. Start development servers as described in SETUP.md"

