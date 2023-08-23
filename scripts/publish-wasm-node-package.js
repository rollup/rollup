import fs from 'node:fs/promises';
import { resolve } from 'node:path';

import { readJson, runWithEcho } from './helpers.js';
import { MAIN_PACKAGE } from './release-constants.js';

const WASM_NODE_PACKAGE_INFO = {
	description: 'Next-generation ES module bundler with Node wasm',
	name: '@rollup/wasm-node'
};
const copiedFilesOrDirectories = ['LICENSE.md', 'README.md', 'dist'];
const packageDir = 'wasm-node-package';
const nativeJsContent = `
const { parse } = require('./wasm-node/bindings_wasm.js');

exports.parse = parse
`;

function getFilePath(...arguments_) {
	return resolve(packageDir, ...arguments_);
}

export default async function publishWasmNodePackage() {
	await fs.mkdir(packageDir);

	const mainPackage = await readJson(MAIN_PACKAGE);
	mainPackage.files.unshift('dist/wasm-node/*.wasm');
	delete mainPackage.napi;

	await Promise.all([
		...copiedFilesOrDirectories.map(file => fs.cp(file, getFilePath(file), { recursive: true })),
		fs.writeFile(
			getFilePath('package.json'),
			JSON.stringify(
				{
					...mainPackage,
					...WASM_NODE_PACKAGE_INFO
				},
				undefined,
				2
			)
		)
	]);

	await Promise.all([
		fs.writeFile(getFilePath('dist', 'native.js'), nativeJsContent.trimStart()),
		fs.cp('artifacts/bindings-wasm-node/wasm-node', getFilePath('dist', 'wasm-node'), {
			recursive: true
		})
	]);

	await runWithEcho('npm', ['publish', packageDir]);
}
