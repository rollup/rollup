import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import type { Workspace } from './fixtures.ts';
import { withWorkspace } from './fixtures.ts';

describe('publish-wasm-node-package', () => {
	it('copies the package contents and publishes the wasm-node package', async () => {
		await withWorkspace({}, async workspace => {
			await importWasmPackageScript(workspace);

			assert.deepEqual(await workspace.readNpmLog(), [
				`${workspace.repoPath}/wasm-node-package publish`
			]);

			const wasmPackage = JSON.parse(
				await workspace.readFileInWorkspace('wasm-node-package/package.json')
			);
			assert.equal(wasmPackage.name, '@rollup/wasm-node');
			assert.equal(wasmPackage.description, 'Next-generation ES module bundler with Node wasm');
			assert.equal(wasmPackage.version, '4.9.0');
			assert.equal(wasmPackage.files[0], 'dist/wasm-node/*.wasm');
			assert.equal(wasmPackage.scripts, undefined);
			assert.equal(wasmPackage.napi, undefined);
			assert.equal(
				await workspace.readFileInWorkspace('wasm-node-package/dist/native.js'),
				'export default {};\n'
			);
			assert.equal(
				await workspace.readFileInWorkspace('wasm-node-package/dist/wasm-node/placeholder.txt'),
				'placeholder\n'
			);
			assert.equal(
				await workspace.readFileInWorkspace('wasm-node-package/LICENSE.md'),
				'License text\n'
			);
		});
	});
});

async function importWasmPackageScript(workspace: Workspace): Promise<void> {
	process.chdir(workspace.repoPath);
	const { default: publishWasmNodePackage } = await import(
		workspace.scriptPath('publish-wasm-node-package.ts')
	);
	await publishWasmNodePackage();
}
