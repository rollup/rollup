#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TypeScript Checks ===${NC}"
echo ""

rm -rf test/typescript/dist
cp -r dist test/typescript/

echo -e "${BLUE}Checking root project...${NC}"
npx tsc --noEmit -p .
echo -e "${GREEN}✓ Root project passed${NC}"
echo ""

echo -e "${BLUE}Checking scripts...${NC}"
npx tsc --noEmit -p scripts
echo -e "${GREEN}✓ Scripts passed${NC}"
echo ""

echo -e "${BLUE}Checking docs...${NC}"
npx vue-tsc --noEmit -p docs
echo -e "${GREEN}✓ Docs passed${NC}"
echo ""

echo -e "${BLUE}Checking test/testHelpers.js...${NC}"
npx tsc -p test
echo -e "${GREEN}✓ test/testHelpers.js passed${NC}"
echo ""

echo -e "${BLUE}Checking for uncommitted changes in test/testHelpers.d.ts...${NC}"
if ! git diff --exit-code test/testHelpers.d.ts > /dev/null 2>&1; then
  echo -e "${RED}ERROR: test/testHelpers.d.ts has uncommitted changes. Please commit this file.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ test/testHelpers.d.ts is up to date${NC}"
echo ""

echo -e "${BLUE}Checking nested test directories...${NC}"
# Find direct children of test/ that contain tsconfig.json
for tsconfig_path in $(find test -mindepth 2 -maxdepth 2 -name "tsconfig.json" -type f | sort); do
  echo -e "${BLUE}Checking $tsconfig_path...${NC}"
  npx tsc -p "$tsconfig_path" --noEmit
  echo -e "${GREEN}✓ $tsconfig_path passed${NC}"
done
echo ""

# Success message
echo -e "${GREEN}=== All TypeScript checks passed! ===${NC}"
