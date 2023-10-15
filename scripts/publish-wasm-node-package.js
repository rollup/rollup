import fs from 'node:fs/promises';
import { resolve } from 'node:path';

import { readJson, runWithEcho } from './helpers.js';
import { MAIN_PACKAGE } from './release-constants.js';

const WASM_NODE_PACKAGE_INFO = {
	description: 'Next-generation ES module bundler with Node wasm',
	name: '@rollup/wasm-node'
};
const COPIED_FILES_OR_DIRS = ['LICENSE.md', 'dist'];
const PACKAGE_DIR = 'wasm-node-package';

function getPath(...arguments_) {
	return resolve(PACKAGE_DIR, ...arguments_);
}

export default async function publishWasmNodePackage() {
	await fs.mkdir(PACKAGE_DIR);

	const mainPackage = await readJson(MAIN_PACKAGE);
	mainPackage.files.unshift('dist/wasm-node/*.wasm');
	delete mainPackage.napi;
	delete mainPackage.scripts;

	await Promise.all([
		...COPIED_FILES_OR_DIRS.map(file => fs.cp(file, getPath(file), { recursive: true })),
		fs.writeFile(
			getPath('package.json'),
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

	const nativeJsContent = await fs.readFile(resolve(__dirname, '../native.wasm.js'), 'utf8');

	await Promise.all([
		fs.writeFile(getPath('dist', 'native.js'), nativeJsContent.trimStart()),
		fs.cp('artifacts/bindings-wasm-node/wasm-node', getPath('dist', 'wasm-node'), {
			recursive: true
		})
	]);

	await runWithEcho('npm', ['publish'], { cwd: resolve(PACKAGE_DIR) });
}
