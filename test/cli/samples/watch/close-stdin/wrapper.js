#!/usr/bin/env node

const { Readable } = require('node:stream');

delete process.stdin;
process.stdin = new Readable({
	encoding: 'utf8',
	read() {
		return null;
	}
});

process.stdin.push(null)

require('../../../../../dist/bin/rollup');
