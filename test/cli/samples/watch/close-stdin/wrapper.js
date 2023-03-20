#!/usr/bin/env node

const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { Readable } = require('node:stream');
const chokidar = require('chokidar');

delete process.stdin;
process.stdin = new Readable({
	encoding: 'utf8',
	read() {
		return null;
	}
});

const outputDir = resolve(__dirname, '_actual');
mkdirSync(outputDir, {recursive: true});
const outputFile = resolve(outputDir, 'out.js');
const INITIAL_OUTPUT = 'NOT WRITTEN';
writeFileSync(outputFile, INITIAL_OUTPUT);

const watcher = chokidar.watch(outputFile).on('change', () => {
	if (readFileSync(outputFile, 'utf8') !== INITIAL_OUTPUT) {
		watcher.close();
		// This closes stdin
		process.stdin.push(null);
	}
});

require('../../../../../dist/bin/rollup');
