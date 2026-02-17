#!/bin/bash

# shibhi.studio Redeploy Script (Bash)
# Performs a clean frontend build and backend deployment with full logging

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$FRONTEND_DIR")"
LOGS_DIR="$FRONTEND_DIR/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BUILD_LOG="$LOGS_DIR/build_${TIMESTAMP}.log"
DEPLOY_LOG="$LOGS_DIR/deploy_${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

echo "========================================" | tee -a "$BUILD_LOG"
echo "shibhi.studio Redeploy - $(date)" | tee -a "$BUILD_LOG"
echo "========================================" | tee -a "$BUILD_LOG"
echo "" | tee -a "$BUILD_LOG"

# Step 1: Clean install frontend dependencies
echo "[1/4] Clean installing frontend dependencies..." | tee -a "$BUILD_LOG"
cd "$FRONTEND_DIR"
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install 2>&1 | tee -a "$BUILD_LOG"
echo "✓ Dependencies installed" | tee -a "$BUILD_LOG"
echo "" | tee -a "$BUILD_LOG"

# Step 2: Generate backend bindings
echo "[2/4] Generating backend bindings..." | tee -a "$BUILD_LOG"
cd "$PROJECT_ROOT"
dfx generate backend 2>&1 | tee -a "$BUILD_LOG"
echo "✓ Backend bindings generated" | tee -a "$BUILD_LOG"
echo "" | tee -a "$BUILD_LOG"

# Step 3: Build frontend
echo "[3/4] Building frontend..." | tee -a "$BUILD_LOG"
cd "$FRONTEND_DIR"
pnpm run build:skip-bindings 2>&1 | tee -a "$BUILD_LOG"
echo "✓ Frontend build complete" | tee -a "$BUILD_LOG"
echo "" | tee -a "$BUILD_LOG"

# Step 4: Deploy backend
echo "[4/4] Deploying backend canister..." | tee -a "$DEPLOY_LOG"
cd "$PROJECT_ROOT"
dfx deploy backend 2>&1 | tee -a "$DEPLOY_LOG"
echo "✓ Backend deployed" | tee -a "$DEPLOY_LOG"
echo "" | tee -a "$DEPLOY_LOG"

echo "========================================" | tee -a "$DEPLOY_LOG"
echo "Redeploy complete!" | tee -a "$DEPLOY_LOG"
echo "Build log: $BUILD_LOG" | tee -a "$DEPLOY_LOG"
echo "Deploy log: $DEPLOY_LOG" | tee -a "$DEPLOY_LOG"
echo "========================================" | tee -a "$DEPLOY_LOG"
