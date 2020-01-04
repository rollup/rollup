#!/usr/bin/env node

const { Readable } = require('stream');
delete process.stdin;
process.stdin = new Readable({
	encoding: 'utf8',
	read() {
		const error = new Error('Stream is broken.');
		return this.destroy ? this.destroy(error) : this.emit('error', error);
	}
});

require('../../../../../dist/bin/rollup');
