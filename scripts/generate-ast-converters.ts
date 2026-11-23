#!/usr/bin/env node

import './generate-ast-macros.ts';
import './generate-ast-to-buffer.ts';
import './generate-ast-types.ts';
import './generate-buffer-inventory.ts';
import './generate-buffer-parsers.ts';
import './generate-buffer-to-ast.ts';
import './generate-buffer-to-lazy-ast.ts';
import './generate-child-node-keys.ts';
import './generate-node-ids.ts';
import './generate-node-type-strings.ts';
import './generate-node-types.ts';
import './generate-node-unions.ts';
import './generate-rust-constants.ts';
import './generate-scope-constants.ts';
import './generate-string-constants.ts';

// Check if we have sufficient test coverage if new nodes are added
import { readdirSync } from 'node:fs';
import { astNodeNamesWithFieldOrder } from './ast-types.ts';
import {
	getBufferFormat,
	getBufferFormatUpdate,
	readBufferFormat,
	writeBufferFormat
} from './buffer-format.ts';

const testDirFromRoot = 'test/parse-and-walk/samples/';
const parseAndWalkTestDir = new URL(`../${testDirFromRoot}`, import.meta.url);
const tests = new Set(readdirSync(parseAndWalkTestDir));

const astNodeTypes = new Set(
	astNodeNamesWithFieldOrder
		.map(({ name }) => name)
		.filter(name => name !== 'PanicError' && name !== 'ParseError')
);

const missingTests: string[] = [];
for (const astType of astNodeTypes) {
	if (!tests.has(`parse-${astType}`)) {
		missingTests.push(astType);
	}
}

if (missingTests.length > 0) {
	console.error(
		`❌ Missing parseAndWalk tests in "${testDirFromRoot}" for the following AST node types:`
	);
	for (const astType of missingTests) {
		console.error(`   - ${astType}`);
	}
	console.error(`\nPlease add test cases in test/parse-and-walk/samples/parse-<NodeType>/\n`);
	process.exit(1);
}

// Keep the recorded layout fingerprint in sync with the generated layout. A
// changed fingerprint fails the generator once, so that the updated file and
// the version bump have to be committed.
const currentBufferFormat = getBufferFormat();
const bufferFormatUpdate = getBufferFormatUpdate(await readBufferFormat(), currentBufferFormat);
if (bufferFormatUpdate) {
	await writeBufferFormat(currentBufferFormat);
	if (bufferFormatUpdate.failure) {
		console.error(`❌ ${bufferFormatUpdate.failure}`);
		process.exit(1);
	}
	console.log('Updated scripts/buffer-format.json to the new buffer format version.');
}
