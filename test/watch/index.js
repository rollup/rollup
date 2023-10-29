const assert = require('node:assert');
const { existsSync, readdirSync, readFileSync, rmSync, unlinkSync } = require('node:fs');
const { rm, unlink, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const { chdir, cwd, hrtime } = require('node:process');
const { copy } = require('fs-extra');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const rollup = require('../../dist/rollup');
const { atomicWriteFileSync, wait } = require('../utils');

describe('rollup.watch', () => {
	let watcher;

	beforeEach(() => {
		chdir(cwd());
		return rm('test/_tmp', {
			force: true,
			recursive: true
		});
	});

	afterEach(() => {
		if (watcher) {
			watcher.close();
			watcher = null;
		}
	});

	it('watches a file and triggers reruns if necessary', async () => {
		let triggerRestart = false;

		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				name: 'test-plugin',
				options() {
					assert.strictEqual(this.meta.watchMode, true, 'watchMode in options');
				},
				async transform(code) {
					assert.strictEqual(this.meta.watchMode, true, 'watchMode in transform');
					if (triggerRestart) {
						triggerRestart = false;
						await wait(100);
						atomicWriteFileSync('test/_tmp/input/main.js', 'export default 44;');
						await wait(100);
						return code;
					}
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				triggerRestart = true;
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 44);
			}
		]);
	});

	it('waits for event listeners', async () => {
		let run = 0;
		const events = new Set();

		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				async writeBundle() {
					if (run++ === 0) {
						await wait(100);
						atomicWriteFileSync('test/_tmp/input/main.js', 'export default 48;');
						await wait(100);
					}
					if (run === 2) {
						watcher.close();
					}
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		await new Promise((resolve, reject) => {
			let currentEvent = null;
			const handleEvent = async (...parameters) => {
				events.add(parameters[0]?.code);
				if (currentEvent) {
					watcher.close();
					return reject(
						new Error(
							`Event ${JSON.stringify(parameters)} was emitted while handling ${JSON.stringify(
								currentEvent
							)}.`
						)
					);
				}
				currentEvent = parameters;
				await wait(100);
				currentEvent = null;
			};
			// This should work but should not have an effect
			watcher.off('event', handleEvent);
			watcher.on('event', handleEvent);
			watcher.on('change', handleEvent);
			watcher.on('restart', handleEvent);
			watcher.on('close', resolve);
		});
		assert.deepStrictEqual([...events], ['START', 'BUNDLE_START', 'BUNDLE_END', 'END', undefined]);
	});

	it('does not fail for virtual files', async () => {
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				resolveId(id) {
					if (id === 'virtual') {
						return id;
					}
				},
				load(id) {
					if (id === 'virtual') {
						return `export const value = 42;`;
					}
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync(
					'test/_tmp/input/main.js',
					"import {value} from 'virtual';\nexport default value + 1;"
				);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('passes file events to the watchChange plugin hook once for each change', async () => {
		let watchChangeCnt = 0;
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		await wait(100);
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			},
			plugins: {
				watchChange(id) {
					watchChangeCnt++;
					assert.strictEqual(id, resolve('test/_tmp/input/main.js'));
				}
			}
		});

		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				watchChangeCnt = 0;
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
				assert.strictEqual(watchChangeCnt, 1);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
				assert.strictEqual(watchChangeCnt, 2);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
				assert.strictEqual(watchChangeCnt, 3);
			}
		]);
	});

	it('passes change parameter to the watchChange plugin hook', async () => {
		const WATCHED_ID = resolve('test/_tmp/input/watched');
		const events = [];
		let ids;
		const expectedIds = [WATCHED_ID, resolve('test/_tmp/input/main.js')];
		await copy('test/watch/samples/watch-files', 'test/_tmp/input');
		await unlink(WATCHED_ID);
		await wait(100);
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				buildDelay: 300
			},
			plugins: {
				buildStart() {
					this.addWatchFile(WATCHED_ID);
				},
				watchChange(id, { event }) {
					assert.strictEqual(id, WATCHED_ID);
					events.push(event);
				},
				buildEnd() {
					ids = this.getWatchFiles();
				}
			}
		});

		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				assert.deepStrictEqual(events, []);
				assert.deepStrictEqual(ids, expectedIds);
				atomicWriteFileSync(WATCHED_ID, 'first');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				assert.deepStrictEqual(events, ['create']);
				assert.deepStrictEqual(ids, expectedIds);
				atomicWriteFileSync(WATCHED_ID, 'first');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				assert.deepStrictEqual(events, ['create', 'update']);
				assert.deepStrictEqual(ids, expectedIds);
				unlinkSync(WATCHED_ID);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				assert.deepStrictEqual(events, ['create', 'update', 'delete']);
				assert.deepStrictEqual(ids, expectedIds);
			}
		]);
	});

	it('correctly rewrites change event during build delay', async () => {
		const WATCHED_ID = resolve('test/_tmp/input/watched');
		const MAIN_ID = resolve('test/_tmp/input/main.js');
		let lastEvent = null;
		await copy('test/watch/samples/watch-files', 'test/_tmp/input');
		await wait(100);
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				buildDelay: 600,
				chokidar: {
					atomic: false
				}
			},
			plugins: {
				buildStart() {
					this.addWatchFile(WATCHED_ID);
				},
				watchChange(id, { event }) {
					if (id === WATCHED_ID) {
						assert.strictEqual(lastEvent, null);
						lastEvent = event;
					}
				}
			}
		});

		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.strictEqual(lastEvent, null);
				atomicWriteFileSync(WATCHED_ID, 'another');
				await wait(100);
				await unlink(WATCHED_ID);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.strictEqual(lastEvent, 'delete');
				lastEvent = null;
				atomicWriteFileSync(WATCHED_ID, '123');
				await wait(100);
				await unlink(WATCHED_ID);
				// To ensure there is always another change to trigger a rebuild
				atomicWriteFileSync(MAIN_ID, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.strictEqual(lastEvent, null);
				atomicWriteFileSync(WATCHED_ID, '123');
				await wait(100);
				atomicWriteFileSync(WATCHED_ID, 'asd');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(lastEvent, 'create');
			}
		]);
	});

	it('calls closeWatcher plugin hook', async () => {
		let calls = 0;
		let context1;
		let context2;
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			},
			plugins: [
				{
					buildStart() {
						// eslint-disable-next-line @typescript-eslint/no-this-alias
						context1 = this;
					},
					closeWatcher() {
						assert.strictEqual(context1, this);
						calls++;
					}
				},
				{
					buildStart() {
						// eslint-disable-next-line @typescript-eslint/no-this-alias
						context2 = this;
					},
					closeWatcher() {
						assert.strictEqual(context2, this);
						calls++;
					}
				}
			]
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				assert.ok(context1);
				assert.ok(context2);
				watcher.once('close', () => {
					assert.strictEqual(calls, 2);
				});
				watcher.close();
			}
		]);
	});

	it('watches a file in code-splitting mode', async () => {
		await copy('test/watch/samples/code-splitting', 'test/_tmp/input');
		watcher = rollup.watch({
			input: ['test/_tmp/input/main1.js', 'test/_tmp/input/main2.js'],
			output: {
				dir: 'test/_tmp/output',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/main1.js'), 21);
				assert.strictEqual(run('../_tmp/output/main2.js'), 42);
				atomicWriteFileSync('test/_tmp/input/shared.js', 'export const value = 22;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/main1.js'), 22);
				assert.strictEqual(run('../_tmp/output/main2.js'), 44);
			}
		]);
	});

	it('watches a file in code-splitting mode with an input object', async () => {
		await copy('test/watch/samples/code-splitting', 'test/_tmp/input');
		watcher = rollup.watch({
			input: {
				_main_1: 'test/_tmp/input/main1.js',
				'subfolder/_main_2': 'test/_tmp/input/main2.js'
			},
			output: {
				dir: 'test/_tmp/output',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/_main_1.js'), 21);
				assert.strictEqual(run('../_tmp/output/subfolder/_main_2.js'), 42);
				atomicWriteFileSync('test/_tmp/input/shared.js', 'export const value = 22;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/_main_1.js'), 22);
				assert.strictEqual(run('../_tmp/output/subfolder/_main_2.js'), 44);
			}
		]);
	});

	it('recovers from an error', async () => {
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export nope;');
			},
			'START',
			'BUNDLE_START',
			"ERROR:Expected '{', got 'nope'",
			'END',
			() => {
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('recovers from an error on initial build', async () => {
		await copy('test/watch/samples/error', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'ERROR:Expression expected',
			'END',
			() => {
				assert.strictEqual(existsSync('../_tmp/output/bundle.js'), false);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('recovers from a plugin error on initial build', async () => {
		let count = 0;
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				transform() {
					if (count++ === 0) {
						this.error('The first run failed, try again.');
					}
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'ERROR:The first run failed, try again.',
			'END',
			() => {
				assert.strictEqual(existsSync('../_tmp/output/bundle.js'), false);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('awaits and recovers from a plugin error in the watchChange hook', async () => {
		let fail = true;
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				async watchChange() {
					await new Promise(resolve => setTimeout(resolve, 300));
					if (fail) {
						this.error('Failed in watchChange');
					}
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 21;');
			},
			'ERROR:Failed in watchChange',
			'END',
			() => {
				fail = false;
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('recovers from an error even when erroring entry was "renamed" (#38)', async () => {
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				unlinkSync('test/_tmp/input/main.js');
				atomicWriteFileSync('test/_tmp/input/main.js', 'export nope;');
			},
			'START',
			'BUNDLE_START',
			"ERROR:Expected '{', got 'nope'",
			'END',
			() => {
				unlinkSync('test/_tmp/input/main.js');
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('recovers from an error even when erroring dependency was "renamed" (#38)', async () => {
		await copy('test/watch/samples/dependency', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
				unlinkSync('test/_tmp/input/dep.js');
				atomicWriteFileSync('test/_tmp/input/dep.js', 'export nope;');
			},
			'START',
			'BUNDLE_START',
			"ERROR:Expected '{', got 'nope'",
			'END',
			() => {
				unlinkSync('test/_tmp/input/dep.js');
				atomicWriteFileSync('test/_tmp/input/dep.js', 'export const value = 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 44);
			}
		]);
	});

	it('handles closing the watcher during a build', async () => {
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				load() {
					watcher.close();
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		const events = [];
		watcher.on('event', event => events.push(event.code));
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			async () => {
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 44;');
				await wait(400);
				assert.deepStrictEqual(events, ['START', 'BUNDLE_START']);
			}
		]);
	});

	it('handles closing the watcher during a build even if an error occurred', async () => {
		await copy('test/watch/samples/error', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				load() {
					watcher.close();
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		const events = [];
		watcher.on('event', event => events.push(event.code));
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			async () => {
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 44;');
				await wait(400);
				assert.deepStrictEqual(events, ['START', 'BUNDLE_START']);
			}
		]);
	});

	it('stops watching files that are no longer part of the graph', async () => {
		await copy('test/watch/samples/dependency', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 42;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				let unexpectedEvent = false;
				watcher.once('event', event => {
					unexpectedEvent = event;
				});
				atomicWriteFileSync('test/_tmp/input/dep.js', '= invalid');
				await wait(400);
				assert.strictEqual(unexpectedEvent, false);
			}
		]);
	});

	it('refuses to watch the output file (#15)', async () => {
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync('test/_tmp/input/main.js', `import '../output/bundle.js'`);
			},
			'START',
			'BUNDLE_START',
			'ERROR:Cannot import the generated bundle',
			'END',
			() => {
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('ignores files that are not specified in options.watch.include, if given', async () => {
		await copy('test/watch/samples/ignored', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				include: ['test/_tmp/input/+(main|foo).js']
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
					foo: 'foo-1',
					bar: 'bar-1'
				});
				atomicWriteFileSync('test/_tmp/input/foo.js', `export default 'foo-2';`);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				let unexpectedEvent = false;
				watcher.once('event', event => {
					unexpectedEvent = event;
				});
				atomicWriteFileSync('test/_tmp/input/bar.js', "export default 'bar-2';");
				await wait(400);
				assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				assert.strictEqual(unexpectedEvent, false);
			}
		]);
	});

	it('ignores files that are specified in options.watch.exclude, if given', async () => {
		await copy('test/watch/samples/ignored', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				exclude: ['test/_tmp/input/bar.js']
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
					foo: 'foo-1',
					bar: 'bar-1'
				});
				atomicWriteFileSync('test/_tmp/input/foo.js', `export default 'foo-2';`);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				let unexpectedEvent = false;
				watcher.once('event', event => {
					unexpectedEvent = event;
				});
				atomicWriteFileSync('test/_tmp/input/bar.js', "export default 'bar-2';");
				await wait(400);
				assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				assert.strictEqual(unexpectedEvent, false);
			}
		]);
	});

	it('only rebuilds the appropriate configs', async () => {
		await copy('test/watch/samples/multiple', 'test/_tmp/input');
		await wait(100);
		watcher = rollup.watch([
			{
				input: 'test/_tmp/input/main1.js',
				output: {
					file: 'test/_tmp/output/bundle1.js',
					format: 'cjs',
					exports: 'auto'
				}
			},
			{
				input: 'test/_tmp/input/main2.js',
				output: {
					file: 'test/_tmp/output/bundle2.js',
					format: 'cjs',
					exports: 'auto'
				}
			}
		]);
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.deepStrictEqual(run('../_tmp/output/bundle1.js'), 42);
				assert.deepStrictEqual(run('../_tmp/output/bundle2.js'), 43);
				atomicWriteFileSync('test/_tmp/input/main2.js', 'export default 44');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.deepStrictEqual(run('../_tmp/output/bundle1.js'), 42);
				assert.deepStrictEqual(run('../_tmp/output/bundle2.js'), 44);
			}
		]);
	});

	it('allows watching only some configs', async () => {
		await copy('test/watch/samples/multiple', 'test/_tmp/input');
		await wait(100);
		watcher = rollup.watch([
			{
				input: 'test/_tmp/input/main1.js',
				watch: false,
				output: {
					file: 'test/_tmp/output/bundle1.js',
					format: 'cjs',
					exports: 'auto'
				}
			},
			{
				input: 'test/_tmp/input/main2.js',
				output: {
					file: 'test/_tmp/output/bundle2.js',
					format: 'cjs',
					exports: 'auto'
				}
			}
		]);
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(existsSync(resolve(__dirname, '../_tmp/output/bundle1.js')), false);
				assert.strictEqual(existsSync(resolve(__dirname, '../_tmp/output/bundle2.js')), true);
				assert.deepStrictEqual(run('../_tmp/output/bundle2.js'), 43);
			}
		]);
	});

	it('respects output.globals', async () => {
		await copy('test/watch/samples/globals', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'iife',
				globals: {
					jquery: 'jQuery'
				}
			},
			external: ['jquery']
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				const generated = readFileSync('test/_tmp/output/bundle.js', {
					encoding: 'utf8'
				});
				assert.ok(/jQuery/.test(generated));
			}
		]);
	});

	it('treats filenames literally, not as globs', async () => {
		await copy('test/watch/samples/non-glob', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync('test/_tmp/input/[foo]/bar.js', `export const bar = 43;`);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
			}
		]);
	});

	it('updates the right hashes on dependency changes', async () => {
		let dynamicName;
		let staticName;
		let chunkName;
		await copy('test/watch/samples/hashing', 'test/_tmp/input');
		watcher = rollup.watch({
			input: ['test/_tmp/input/main-static.js', 'test/_tmp/input/main-dynamic.js'],
			output: {
				dir: 'test/_tmp/output',
				format: 'cjs',
				exports: 'auto',
				entryFileNames: '[name].[hash].js',
				chunkFileNames: '[name].[hash].js'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				[dynamicName, staticName, chunkName] = readdirSync('test/_tmp/output').sort();
				rmSync('test/_tmp/output', {
					force: true,
					recursive: true
				});

				// this should only update the hash of that particular entry point
				atomicWriteFileSync(
					'test/_tmp/input/main-static.js',
					"import {value} from './shared';\nexport default 2 * value;"
				);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				const [newDynamicName, newStaticName, newChunkName] =
					readdirSync('test/_tmp/output').sort();
				rmSync('test/_tmp/output', {
					force: true,
					recursive: true
				});
				assert.notEqual(newStaticName, staticName);
				assert.strictEqual(newDynamicName, dynamicName);
				assert.strictEqual(newChunkName, chunkName);
				staticName = newStaticName;

				// this should update all hashes
				atomicWriteFileSync('test/_tmp/input/shared.js', 'export const value = 42;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				const [newDynamicName, newStaticName, newChunkName] =
					readdirSync('test/_tmp/output').sort();
				assert.notEqual(newStaticName, staticName);
				assert.notEqual(newDynamicName, dynamicName);
				assert.notEqual(newChunkName, chunkName);
			}
		]);
	});

	it('runs transforms again on previously erroring files that were changed back', async () => {
		const brokenFiles = new Set();
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		const INITIAL_CONTENT = 'export default 42;';
		atomicWriteFileSync('test/_tmp/input/main.js', INITIAL_CONTENT);
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				transform(code, id) {
					if (code.includes('broken')) {
						brokenFiles.add(id);
						throw new Error('Broken in transform');
					}
					brokenFiles.delete(id);
				},
				generateBundle() {
					if (brokenFiles.size > 0) {
						throw new Error('Broken in generate');
					}
				}
			},
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default "broken";');
			},
			'START',
			'BUNDLE_START',
			'ERROR:Broken in transform',
			() => {
				atomicWriteFileSync('test/_tmp/input/main.js', INITIAL_CONTENT);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
			}
		]);
	});

	it('skips filesystem writes when configured', async () => {
		let watchChangeCnt = 0;
		await copy('test/watch/samples/skip-writes', 'test/_tmp/input');
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				skipWrite: true
			},
			plugins: {
				watchChange(id) {
					watchChangeCnt++;
					assert.strictEqual(id, resolve('test/_tmp/input/main.js'));
				}
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				watchChangeCnt = 0;
				assert.strictEqual(existsSync('../_tmp/output/bundle.js'), false);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(existsSync('../_tmp/output/bundle.js'), false);
				assert.strictEqual(watchChangeCnt, 1);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(existsSync('../_tmp/output/bundle.js'), false);
				assert.strictEqual(watchChangeCnt, 2);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			// 'END',
			event => {
				assert.strictEqual(existsSync('../_tmp/output/bundle.js'), false);
				assert.strictEqual(watchChangeCnt, 3);
				// still aware of its output destination
				assert.strictEqual(event.output[0], resolve('test/_tmp/output/bundle.js'));
			}
		]);
	});

	it('rebuilds immediately by default', async () => {
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		await wait(300);
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			output: {
				file: 'test/_tmp/output/bundle.js',
				format: 'cjs',
				exports: 'auto'
			}
		});

		let startTime;
		return sequence(
			watcher,
			[
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
					atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
					startTime = hrtime();
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
					const timeDiff = getTimeDiffInMs(startTime);
					assert.ok(timeDiff < 400, `Time difference ${timeDiff} < 400`);
				}
			],
			0
		);
	}).retries(1);

	it('observes configured build delays', async () => {
		await copy('test/watch/samples/basic', 'test/_tmp/input');
		watcher = rollup.watch(
			[
				{
					input: 'test/_tmp/input/main.js',
					output: {
						file: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						exports: 'auto'
					}
				},
				{
					input: 'test/_tmp/input/main.js',
					watch: { clearScreen: true },
					output: {
						file: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						exports: 'auto'
					}
				},
				{
					input: 'test/_tmp/input/main.js',
					watch: { buildDelay: 1000 },
					output: {
						file: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						exports: 'auto'
					}
				},
				{
					input: 'test/_tmp/input/main.js',
					watch: { buildDelay: 50 },
					output: {
						file: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						exports: 'auto'
					}
				}
			],
			0
		);

		let startTime;
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'BUNDLE_START',
			'BUNDLE_END',
			'BUNDLE_START',
			'BUNDLE_END',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
				atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
				startTime = hrtime();
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'BUNDLE_START',
			'BUNDLE_END',
			'BUNDLE_START',
			'BUNDLE_END',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run('../_tmp/output/bundle.js'), 43);
				const timeDiff = getTimeDiffInMs(startTime);
				assert.ok(timeDiff > 1000, `Time difference ${timeDiff} > 1000`);
			}
		]);
	});

	describe('addWatchFile', () => {
		it('supports adding additional watch files in plugin hooks', async () => {
			const watchChangeIds = new Set();
			const buildStartFile = resolve('test/_tmp/input/buildStart');
			const loadFile = resolve('test/_tmp/input/load');
			const resolveIdFile = resolve('test/_tmp/input/resolveId');
			const transformFile = resolve('test/_tmp/input/transform');
			const watchFiles = [buildStartFile, loadFile, resolveIdFile, transformFile];
			await copy('test/watch/samples/basic', 'test/_tmp/input');

			await Promise.all(watchFiles.map(file => writeFile(file, 'initial')));

			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					buildStart() {
						this.addWatchFile(buildStartFile);
					},
					load() {
						this.addWatchFile(loadFile);
					},
					resolveId() {
						this.addWatchFile(resolveIdFile);
					},
					transform() {
						this.addWatchFile(transformFile);
					},
					watchChange(id) {
						watchChangeIds.add(id);
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				async () => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
					// sometimes the watcher is triggered during the initial run
					watchChangeIds.clear();

					await Promise.all(watchFiles.map(file => writeFile(file, 'changed')));
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
					assert.deepStrictEqual([...watchChangeIds].sort(), watchFiles.sort());
				}
			]);
		});

		it('respects changed watched files in the load hook', async () => {
			const WATCHED_ID = resolve('test/_tmp/input/watched');
			await copy('test/watch/samples/watch-files', 'test/_tmp/input');
			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					load() {
						this.addWatchFile(WATCHED_ID);
						return `export default "${readFileSync(WATCHED_ID).toString().trim()}"`;
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 'initial');
					atomicWriteFileSync(WATCHED_ID, 'next');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 'next');
				}
			]);
		});

		it('respects changed watched files in the transform hook and removes them if they are no longer watched', async () => {
			const WATCHED_ID = resolve('test/_tmp/input/watched');
			let addWatchFile = true;
			await copy('test/watch/samples/watch-files', 'test/_tmp/input');
			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					resolveId(id) {
						if (id === 'dep') {
							return id;
						}
					},
					load(id) {
						if (id === 'dep') {
							return `throw new Error('This should not be executed);`;
						}
					},
					transform(code, id) {
						if (id.endsWith('main.js')) {
							return `export { value as default } from 'dep';`;
						} else {
							if (addWatchFile) {
								this.addWatchFile(WATCHED_ID);
							}
							return `export const value = "${readFileSync(WATCHED_ID).toString().trim()}"`;
						}
					}
				}
			});
			const events = [];
			watcher.on('event', event => events.push(event.code));
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 'initial');
					addWatchFile = false;
					atomicWriteFileSync(WATCHED_ID, 'next');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				async () => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), 'next');
					atomicWriteFileSync(WATCHED_ID, 'other');
					events.length = 0;
					await wait(400);
					assert.deepStrictEqual(events, []);
				}
			]);
		});

		it('respects changed watched modules that are already part of the graph in the transform hook', async () => {
			await copy('test/watch/samples/dependencies', 'test/_tmp/input');
			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform(code, id) {
						if (id.endsWith('dep1.js')) {
							this.addWatchFile(resolve('test/_tmp/input/dep2.js'));
							const text = readFileSync('test/_tmp/input/dep2.js').toString().trim();
							return `export default ${JSON.stringify(text)}`;
						}
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(
						run('../_tmp/output/bundle.js'),
						`dep1: "export default 'dep2';", dep2: "dep2"`
					);
					atomicWriteFileSync('test/_tmp/input/dep2.js', 'export default "next";');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(
						run('../_tmp/output/bundle.js'),
						`dep1: "export default "next";", dep2: "next"`
					);
				}
			]);
		});

		it('respects changed watched directories in the transform hook', async () => {
			const WATCHED_ID = resolve('test/_tmp/input/watched');
			await copy('test/watch/samples/watch-files', 'test/_tmp/input');
			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform() {
						this.addWatchFile('test/_tmp/input');
						return `export default ${existsSync(WATCHED_ID)}`;
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), true);
					unlinkSync(WATCHED_ID);
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), false);
					watcher.close();
				}
			]);
		});

		it('respects initially missing added watched files', async () => {
			await copy('test/watch/samples/basic', 'test/_tmp/input');
			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform() {
						this.addWatchFile('test/_tmp/input/dep');
						return `export default ${existsSync('test/_tmp/input/dep')}`;
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), false);
					atomicWriteFileSync('test/_tmp/input/dep', '');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), true);
				}
			]);
		});

		it('respects unlinked and re-added watched files', async () => {
			await copy('test/watch/samples/basic', 'test/_tmp/input');
			await writeFile('test/_tmp/input/dep', '');
			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform() {
						this.addWatchFile('test/_tmp/input/dep');
						return `export default ${existsSync('test/_tmp/input/dep')}`;
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), true);
					unlinkSync('test/_tmp/input/dep');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), false);
					atomicWriteFileSync('test/_tmp/input/dep', '');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run('../_tmp/output/bundle.js'), true);
				}
			]);
		});

		it('does not rerun the transform hook if a non-watched change triggered the re-run', async () => {
			const WATCHED_ID = resolve('test/_tmp/input/watched');
			let transformRuns = 0;
			await copy('test/watch/samples/watch-files', 'test/_tmp/input');
			await wait(100);
			await writeFile('test/_tmp/input/alsoWatched', 'initial');
			watcher = rollup.watch({
				input: 'test/_tmp/input/main.js',
				output: {
					file: 'test/_tmp/output/bundle.js',
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					buildStart() {
						this.addWatchFile('test/_tmp/input/alsoWatched');
					},
					transform() {
						transformRuns++;
						this.addWatchFile(WATCHED_ID);
						return `export default "${readFileSync(WATCHED_ID).toString().trim()}"`;
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(transformRuns, 1);
					atomicWriteFileSync('test/_tmp/input/alsoWatched', 'next');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(transformRuns, 1);
				}
			]);
		});
	});
});

function run(file) {
	const resolved = require.resolve(file);
	delete require.cache[resolved];
	return require(resolved);
}

function sequence(watcher, events, timeout = 300) {
	const handledEvents = [];
	const sequencePromise = new Promise((fulfil, reject) => {
		function go(event) {
			const next = events.shift();
			if (!next) {
				handledEvents.push('DONE');
				watcher.close();
				fulfil();
			} else if (typeof next === 'string') {
				handledEvents.push(next);
				const [eventCode, eventMessage] = next.split(':');
				watcher.once('event', event => {
					if (event.code !== eventCode) {
						watcher.close();
						if (event.code === 'ERROR') console.log(event.error);
						reject(new Error(`Expected ${eventCode} event, got ${event.code}`));
					} else if (
						eventCode === 'ERROR' &&
						eventMessage &&
						event.error.message !== eventMessage
					) {
						reject(
							new Error(`Expected to throw "${eventMessage}" but got "${event.error.message}".`)
						);
					} else {
						go(event);
					}
				});
			} else {
				wait(timeout) // gah, this appears to be necessary to fix random errors
					.then(() => {
						handledEvents.push(`fn: ${JSON.stringify(event)}`);
						next(event);
						go();
					})
					.catch(error => {
						watcher.close();
						reject(error);
					});
			}
		}

		go();
	});

	return Promise.race([
		sequencePromise.then(() => wait(100)),
		wait(20_000).then(() => {
			throw new Error(`Test timed out\n${handledEvents.join('\n')}`);
		})
	]);
}

function getTimeDiffInMs(previous) {
	const [seconds, nanoseconds] = hrtime(previous);
	return seconds * 1e3 + nanoseconds / 1e6;
}
