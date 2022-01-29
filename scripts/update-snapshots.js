#!/usr/bin/env node

const { readdirSync } = require('fs');
const { resolve, join } = require('path');
const { copySync, removeSync } = require('fs-extra');

const basePath = resolve(__dirname, '../test');

const formPath = join(basePath, 'form/samples');
const formDirsToHandle = readdirSync(formPath);
for (const dir of formDirsToHandle) {
	const testPath = join(formPath, dir);
	const testFiles = readdirSync(testPath);
	if (!testFiles.includes('_config.js')) {
		formDirsToHandle.push(...testFiles.map(filename => join(dir, filename)));
	} else if (testFiles.includes('_actual')) {
		const expectedPath = join(testPath, '_expected');
		removeSync(expectedPath);
		copySync(join(testPath, '_actual'), expectedPath);
	} else if (testFiles.includes('_actual.js')) {
		copySync(join(testPath, '_actual.js'), join(testPath, '_expected.js'));
	} else {
		throw new Error(`Could not find test output in ${testPath}`);
	}
}

const chunkingPath = join(basePath, 'chunking-form/samples');
const chunkingDirsToHandle = readdirSync(chunkingPath);
for (const dir of chunkingDirsToHandle) {
	const testPath = join(chunkingPath, dir);
	const testFiles = readdirSync(testPath);
	if (!testFiles.includes('_config.js')) {
		chunkingDirsToHandle.push(...testFiles.map(filename => join(dir, filename)));
	} else if (testFiles.includes('_actual')) {
		const expectedPath = join(testPath, '_expected');
		removeSync(expectedPath);
		copySync(join(testPath, '_actual'), expectedPath);
	} else {
		throw new Error(`Could not find test output in ${testPath}`);
	}
}
