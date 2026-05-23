const assert = require('node:assert');
const { Volume } = require('memfs');
const rollup = require('../../dist/rollup');

describe('fs-override', () => {
	it('uses fs from options', async () => {
		const vol = Volume.fromJSON(
			{
				'/input.js': "console.log('Hello, Rollup!');"
			},
			__dirname
		);
		const bundle = await rollup.rollup({
			input: '/input.js',
			fs: vol.promises
		});

		try {
			await bundle.write({
				file: '/output.js',
				format: 'esm'
			});

			const generatedCode = vol.readFileSync('/output.js', 'utf8');
			assert.strictEqual(generatedCode.trim(), "console.log('Hello, Rollup!');");
		} finally {
			await bundle.close();
		}
	});

	it('passes fs from options to plugin context', async () => {
		const vol = Volume.fromJSON(
			{
				'/input.js': "console.log('Hello, Rollup!');"
			},
			__dirname
		);
		const bundle = await rollup.rollup({
			input: '/input.js',
			fs: vol.promises,
			plugins: [
				{
					name: 'test-plugin',
					async transform(code, _id) {
						assert.equal(await this.fs.readFile('/input.js'), "console.log('Hello, Rollup!');");
						return {
							code,
							map: null
						};
					}
				}
			]
		});

		try {
			await bundle.write({
				file: '/output.js',
				format: 'esm'
			});
		} finally {
			await bundle.close();
		}
	});

	it('preserves original asset permissions when writing emitted assets', async () => {
		const vol = Volume.fromJSON(
			{
				'/asset.sh': '#!/bin/sh\necho asset\n',
				'/input.js': ''
			},
			__dirname
		);
		vol.chmodSync('/asset.sh', 0o755);
		const chmodCalls = [];
		const writeFileArgumentCounts = [];
		const fs = new Proxy(vol.promises, {
			get(target, property) {
				if (property === 'chmod') {
					return async (path, mode) => {
						chmodCalls.push([path, mode]);
						return target.chmod(path, mode);
					};
				}
				if (property === 'writeFile') {
					return async (...parameters) => {
						writeFileArgumentCounts.push(parameters.length);
						return target.writeFile(...parameters);
					};
				}
				return Reflect.get(target, property, target);
			}
		});

		const bundle = await rollup.rollup({
			input: '/input.js',
			fs,
			plugins: [
				{
					name: 'test-plugin',
					async buildStart() {
						this.emitFile({
							type: 'asset',
							name: 'asset.sh',
							originalFileName: '/asset.sh',
							source: await this.fs.readFile('/asset.sh')
						});
					}
				}
			]
		});

		try {
			await bundle.write({
				assetFileNames: '[name][extname]',
				dir: '/dist',
				format: 'esm'
			});

			assert.deepStrictEqual(chmodCalls, [['/dist/asset.sh', 0o755]]);
			assert.deepStrictEqual(
				writeFileArgumentCounts,
				writeFileArgumentCounts.map(() => 2)
			);
			assert.strictEqual(vol.statSync('/dist/asset.sh').mode & 0o777, 0o755);
		} finally {
			await bundle.close();
		}
	});

	it('surfaces unexpected stat errors while reading original asset permissions', async () => {
		const vol = Volume.fromJSON(
			{
				'/asset.sh': '#!/bin/sh\necho asset\n',
				'/input.js': ''
			},
			__dirname
		);
		const fs = new Proxy(vol.promises, {
			get(target, property) {
				if (property === 'stat') {
					return async path => {
						if (path === '/asset.sh') {
							const error = new Error('permission denied');
							error.code = 'EACCES';
							throw error;
						}
						return target.stat(path);
					};
				}
				return Reflect.get(target, property, target);
			}
		});

		const bundle = await rollup.rollup({
			input: '/input.js',
			fs,
			plugins: [
				{
					name: 'test-plugin',
					async buildStart() {
						this.emitFile({
							type: 'asset',
							name: 'asset.sh',
							originalFileName: '/asset.sh',
							source: await this.fs.readFile('/asset.sh')
						});
					}
				}
			]
		});

		try {
			await assert.rejects(
				bundle.write({
					assetFileNames: '[name][extname]',
					dir: '/dist',
					format: 'esm'
				}),
				/permission denied/
			);
		} finally {
			await bundle.close();
		}
	});
});
