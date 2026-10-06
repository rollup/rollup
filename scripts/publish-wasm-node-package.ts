import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, runWithEcho } from './helpers.ts';
import { MAIN_PACKAGE } from './release-constants.ts';

const WASM_NODE_PACKAGE_INFO = {
	description: 'Next-generation ES module bundler with Node wasm',
	name: '@rollup/wasm-node'
};
const COPIED_FILES_OR_DIRS = ['LICENSE.md', 'dist'];
const PACKAGE_DIR = fileURLToPath(new URL('../wasm-node-package', import.meta.url));

function getOutputPath(...pathSegments: string[]): string {
	return path.resolve(PACKAGE_DIR, ...pathSegments);
}

export default async function publishWasmNodePackage(): Promise<void> {
	await mkdir(PACKAGE_DIR);

	const mainPackage = await readJson(MAIN_PACKAGE);
	mainPackage.files.unshift('dist/wasm-node/*.wasm');
	delete mainPackage.napi;
	delete mainPackage.scripts;

	await Promise.all([
		...COPIED_FILES_OR_DIRS.map(file => cp(file, getOutputPath(file), { recursive: true })),
		writeFile(
			getOutputPath('package.json'),
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

	const nativeJsContent = await readFile(new URL('../native.wasm.js', import.meta.url), 'utf8');

	await Promise.all([
		writeFile(getOutputPath('dist', 'native.js'), nativeJsContent.trimStart()),
		cp('artifacts/bindings-wasm-node/wasm-node', getOutputPath('dist', 'wasm-node'), {
			recursive: true
		})
	]);

	await runWithEcho('npm', ['publish'], { cwd: path.resolve(PACKAGE_DIR) });
}
