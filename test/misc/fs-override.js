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

		await bundle.write({
			file: '/output.js',
			format: 'esm'
		});

		const generatedCode = vol.readFileSync('/output.js', 'utf8');
		assert.strictEqual(generatedCode.trim(), "console.log('Hello, Rollup!');");
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

		await bundle.write({
			file: '/output.js',
			format: 'esm'
		});
	});

	it('exposes only the RollupFsModule methods via this.fs', async () => {
		const vol = Volume.fromJSON(
			{
				'/input.js': "console.log('Hello, Rollup!');"
			},
			__dirname
		);
		let exposedMethodNames;
		await rollup.rollup({
			input: '/input.js',
			fs: vol.promises,
			plugins: [
				{
					name: 'test-plugin',
					buildStart() {
						exposedMethodNames = Object.keys(this.fs).sort();
					}
				}
			]
		});
		assert.deepStrictEqual(exposedMethodNames, [
			'appendFile',
			'copyFile',
			'lstat',
			'mkdir',
			'mkdtemp',
			'readFile',
			'readdir',
			'realpath',
			'rename',
			'rmdir',
			'stat',
			'unlink',
			'writeFile'
		]);
	});

	it('limits parallel write operations to maxParallelFileOps', async () => {
		const vol = Volume.fromJSON(
			{
				'/a.js': 'export const a = 1;',
				'/b.js': 'export const b = 2;',
				'/c.js': 'export const c = 3;'
			},
			__dirname
		);
		const countingFs = new CountingFs(vol.promises);
		const bundle = await rollup.rollup({
			input: ['/a.js', '/b.js', '/c.js'],
			fs: countingFs,
			maxParallelFileOps: 2
		});
		await bundle.write({ dir: '/output', format: 'esm' });
		assert.strictEqual(
			countingFs.maxActiveWrites,
			2,
			'Wrong number of parallel write operations: ' + countingFs.maxActiveWrites
		);
	});
});

class CountingFs {
	constructor(realFs) {
		this.realFs = realFs;
		this.activeWrites = 0;
		this.maxActiveWrites = 0;
	}

	trackWrite(writePromise) {
		this.activeWrites++;
		this.maxActiveWrites = Math.max(this.maxActiveWrites, this.activeWrites);
		return writePromise.finally(() => {
			this.activeWrites--;
		});
	}

	appendFile(path, data, options) {
		return this.realFs.appendFile(path, data, options);
	}

	copyFile(source, destination, mode) {
		return this.realFs.copyFile(source, destination, mode);
	}

	lstat(path) {
		return this.realFs.lstat(path);
	}

	mkdir(path, options) {
		return this.trackWrite(this.realFs.mkdir(path, options));
	}

	mkdtemp(prefix) {
		return this.realFs.mkdtemp(prefix);
	}

	readdir(path, options) {
		return this.realFs.readdir(path, options);
	}

	readFile(path, options) {
		return this.realFs.readFile(path, options);
	}

	realpath(path) {
		return this.realFs.realpath(path);
	}

	rename(oldPath, newPath) {
		return this.realFs.rename(oldPath, newPath);
	}

	rmdir(path, options) {
		return this.realFs.rmdir(path, options);
	}

	stat(path) {
		return this.realFs.stat(path);
	}

	unlink(path) {
		return this.realFs.unlink(path);
	}

	writeFile(path, data, options) {
		return this.trackWrite(this.realFs.writeFile(path, data, options));
	}
}
