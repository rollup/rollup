#!/usr/bin/env vite-node

import './generate-ast-macros.js';
import './generate-ast-to-buffer.js';
import './generate-ast-types.js';
import './generate-buffer-parsers.js';
import './generate-buffer-to-ast.js';
import './generate-buffer-to-lazy-ast.js';
import './generate-child-node-keys.js';
import './generate-node-ids.js';
import './generate-node-type-strings.js';
import './generate-node-types.js';
import './generate-node-unions.js';
import './generate-rust-constants.js';
import './generate-string-constants.js';

// Check if we have sufficient test coverage if new nodes are added
import { readdirSync } from 'node:fs';
import { astNodeNamesWithFieldOrder } from './ast-types.js';

const testDirFromRoot = 'test/function/samples/parse-and-walk/';
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
	console.error(
		`\nPlease add test cases in test/function/samples/parse-and-walk/parse-<NodeType>/\n`
	);
	process.exit(1);
}
