#!/usr/bin/env node

process.stdin.isTTY = true;
require('../../../../../dist/bin/rollup');
