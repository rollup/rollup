#!/usr/bin/env node

const stream = require('stream');
const fs = require('fs');
const path = require('path');

delete process.stdin;
process.stdin = new stream.Readable({
	encoding: 'utf8',
	read() {
		return null;
	}
});

const outputDir = path.resolve(__dirname, '_actual');
fs.mkdirSync(outputDir);
const outputFile = path.resolve(outputDir, 'out.js');
fs.writeFileSync(outputFile, 'NOT WRITTEN');

const watcher = fs.watch(outputFile, () => {
	watcher.close();
	// This closes stdin
	process.stdin.push(null);
});

require('../../../../../dist/bin/rollup');
