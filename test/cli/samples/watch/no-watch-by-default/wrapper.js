#!/usr/bin/env node

process.stdout.isTTY = true;
process.stderr.isTTY = true;
require('../../../../../dist/bin/rollup');
