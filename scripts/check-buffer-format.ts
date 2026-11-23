#!/usr/bin/env node

import { assertVersionWasIncreased, getBufferFormat, readBufferFormat } from './buffer-format.ts';

const previousBufferFormatFile = process.argv[2];

if (!previousBufferFormatFile) {
	console.error('❌ Usage: check-buffer-format.ts <previous buffer format file>');
	process.exit(1);
}

let previousBufferFormat;
try {
	previousBufferFormat = await readBufferFormat(previousBufferFormatFile);
} catch (error) {
	console.error(`❌ Cannot read ${previousBufferFormatFile}: ${(error as Error).message}`);
	process.exit(1);
}

if (!previousBufferFormat) {
	console.log('No previous buffer format available, skipping the version check.');
	process.exit(0);
}

try {
	assertVersionWasIncreased(previousBufferFormat, getBufferFormat());
} catch (error) {
	console.error(`❌ ${(error as Error).message}`);
	process.exit(1);
}
console.log('The buffer format version is valid.');
