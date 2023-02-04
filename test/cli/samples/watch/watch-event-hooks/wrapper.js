#!/usr/bin/env node

process.stdout.isTTY = true;
process.stderr.isTTY = true;
process.stderr.hasColors = () => true;
require('../../../../../dist/bin/rollup');
