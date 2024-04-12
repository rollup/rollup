const assert = require('node:assert');
const { existsSync, readdirSync, readFileSync, rmSync, unlinkSync } = require('node:fs');
const { rm, unlink, writeFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const { hrtime } = require('node:process');
const { copy } = require('fs-extra');
/**
 * @type {import("../../src/rollup/types")} Rollup
 */
const rollup = require('../../dist/rollup');
const { atomicWriteFileSync, wait, withTimeout } = require('../utils');

const SAMPLES_DIR = path.join(__dirname, 'samples');
const TEMP_DIR = path.join(__dirname, '../_tmp');
const INPUT_DIR = path.join(TEMP_DIR, 'input');
const ENTRY_FILE = path.join(INPUT_DIR, 'main.js');
const OUTPUT_DIR = path.join(TEMP_DIR, 'output');
const BUNDLE_FILE = path.join(OUTPUT_DIR, 'bundle.js');

describe('rollup.watch', function () {
	this.timeout(40_000);
	let watcher;

	beforeEach(async () => {
		process.chdir(__dirname);
		await rm(TEMP_DIR, {
			force: true,
			recursive: true
		});
		await mkdir(INPUT_DIR, { recursive: true });
		process.chdir(INPUT_DIR);
	});

	afterEach(async () => {
		if (watcher) {
			watcher.close();
			watcher = null;
		}
	});

	it('watches a file and triggers reruns if necessary', async () => {
		let triggerRestart = false;

		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
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
						atomicWriteFileSync(ENTRY_FILE, 'export default 44;');
						await wait(100);
						return code;
					}
				}
			},
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				triggerRestart = true;
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
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
				assert.strictEqual(run(BUNDLE_FILE), 44);
			}
		]);
	});

	it('waits for event listeners', async () => {
		let run = 0;
		const events = new Set();

		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			plugins: {
				async writeBundle() {
					if (run++ === 0) {
						await wait(100);
						atomicWriteFileSync(ENTRY_FILE, 'export default 48;');
						await wait(100);
					}
					if (run === 2) {
						watcher.close();
					}
				}
			},
			output: {
				file: BUNDLE_FILE,
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
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
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
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(
					ENTRY_FILE,
					"import {value} from 'virtual';\nexport default value + 1;"
				);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('passes file events to the watchChange plugin hook once for each change', async () => {
		let watchChangeCnt = 0;
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		await wait(100);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
				format: 'cjs',
				exports: 'auto'
			},
			plugins: {
				watchChange(id) {
					watchChangeCnt++;
					assert.strictEqual(id, ENTRY_FILE);
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
				assert.strictEqual(watchChangeCnt, 1);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
				assert.strictEqual(watchChangeCnt, 2);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
				assert.strictEqual(watchChangeCnt, 3);
			}
		]);
	});

	it('passes change parameter to the watchChange plugin hook', async () => {
		const WATCHED_ID = path.join(INPUT_DIR, 'watched');
		const events = [];
		let ids;
		const expectedIds = [WATCHED_ID, ENTRY_FILE];
		await copy(path.join(SAMPLES_DIR, 'watch-files'), INPUT_DIR);
		await unlink(WATCHED_ID);
		await wait(100);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				assert.deepStrictEqual(events, []);
				assert.deepStrictEqual(ids, expectedIds);
				atomicWriteFileSync(WATCHED_ID, 'first');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 42);
				assert.deepStrictEqual(events, ['create']);
				assert.deepStrictEqual(ids, expectedIds);
				atomicWriteFileSync(WATCHED_ID, 'first');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 42);
				assert.deepStrictEqual(events, ['create', 'update']);
				assert.deepStrictEqual(ids, expectedIds);
				unlinkSync(WATCHED_ID);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 42);
				assert.deepStrictEqual(events, ['create', 'update', 'delete']);
				assert.deepStrictEqual(ids, expectedIds);
			}
		]);
	});

	it('correctly rewrites change event during build delay', async () => {
		const WATCHED_ID = path.join(INPUT_DIR, 'watched');
		const MAIN_ID = ENTRY_FILE;
		let lastEvent = null;
		await copy(path.join(SAMPLES_DIR, 'watch-files'), INPUT_DIR);
		await wait(100);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
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
		await copy(path.join(SAMPLES_DIR, 'code-splitting'), INPUT_DIR);
		watcher = rollup.watch({
			input: [path.join(INPUT_DIR, 'main1.js'), path.join(INPUT_DIR, 'main2.js')],
			output: {
				dir: OUTPUT_DIR,
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
				assert.strictEqual(run(path.join(OUTPUT_DIR, 'main1.js')), 21);
				assert.strictEqual(run(path.join(OUTPUT_DIR, 'main2.js')), 42);
				atomicWriteFileSync(path.join(INPUT_DIR, 'shared.js'), 'export const value = 22;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(path.join(OUTPUT_DIR, 'main1.js')), 22);
				assert.strictEqual(run(path.join(OUTPUT_DIR, 'main2.js')), 44);
			}
		]);
	});

	it('watches a file in code-splitting mode with an input object', async () => {
		await copy(path.join(SAMPLES_DIR, 'code-splitting'), INPUT_DIR);
		watcher = rollup.watch({
			input: {
				_main_1: path.join(INPUT_DIR, 'main1.js'),
				'subfolder/_main_2': path.join(INPUT_DIR, 'main2.js')
			},
			output: {
				dir: OUTPUT_DIR,
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
				assert.strictEqual(run(path.join(OUTPUT_DIR, '_main_1.js')), 21);
				assert.strictEqual(run(path.join(OUTPUT_DIR, 'subfolder/_main_2.js')), 42);
				atomicWriteFileSync(path.join(INPUT_DIR, 'shared.js'), 'export const value = 22;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(path.join(OUTPUT_DIR, '_main_1.js')), 22);
				assert.strictEqual(run(path.join(OUTPUT_DIR, 'subfolder/_main_2.js')), 44);
			}
		]);
	});

	it('recovers from an error', async () => {
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(ENTRY_FILE, 'export nope;');
			},
			'START',
			'BUNDLE_START',
			"ERROR:main.js (1:7): Expected '{', got 'nope'",
			'END',
			() => {
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('recovers from an error on initial build', async () => {
		await copy(path.join(SAMPLES_DIR, 'error'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'ERROR:main.js (2:0): Expression expected',
			'END',
			() => {
				assert.strictEqual(existsSync(BUNDLE_FILE), false);
				atomicWriteFileSync(ENTRY_FILE, '' + 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('recovers from a plugin error on initial build', async () => {
		let error = true;
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			plugins: {
				transform() {
					if (error) {
						this.error('This run failed, try again.');
					}
				}
			},
			output: {
				file: BUNDLE_FILE,
				format: 'cjs',
				exports: 'auto'
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'ERROR:[plugin at position 1] main.js: This run failed, try again.',
			'END',
			() => {
				error = false;
				assert.strictEqual(existsSync(BUNDLE_FILE), false);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('awaits and recovers from a plugin error in the watchChange hook', async () => {
		let fail = true;
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			plugins: {
				async watchChange() {
					await wait(300);
					if (fail) {
						this.error('Failed in watchChange');
					}
				}
			},
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(ENTRY_FILE, 'export default 21;');
			},
			'ERROR:[plugin at position 1] Failed in watchChange',
			'END',
			() => {
				fail = false;
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('recovers from an error even when erroring entry was "renamed" (#38)', async () => {
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				unlinkSync(ENTRY_FILE);
				atomicWriteFileSync(ENTRY_FILE, 'export nope;');
			},
			'START',
			'BUNDLE_START',
			"ERROR:main.js (1:7): Expected '{', got 'nope'",
			'END',
			() => {
				unlinkSync(ENTRY_FILE);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('recovers from an error even when erroring dependency was "renamed" (#38)', async () => {
		await copy(path.join(SAMPLES_DIR, 'dependency'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 43);
				unlinkSync(path.join(INPUT_DIR, 'dep.js'));
				atomicWriteFileSync(path.join(INPUT_DIR, 'dep.js'), 'export nope;');
			},
			'START',
			'BUNDLE_START',
			"ERROR:dep.js (1:7): Expected '{', got 'nope'",
			'END',
			() => {
				unlinkSync(path.join(INPUT_DIR, 'dep.js'));
				atomicWriteFileSync(path.join(INPUT_DIR, 'dep.js'), 'export const value = 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 44);
			}
		]);
	});

	it('handles closing the watcher during a build', async () => {
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			plugins: {
				load() {
					watcher.close();
				}
			},
			output: {
				file: BUNDLE_FILE,
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
				atomicWriteFileSync(ENTRY_FILE, 'export default 44;');
				await wait(400);
				assert.deepStrictEqual(events, ['START', 'BUNDLE_START']);
			}
		]);
	});

	it('handles closing the watcher during a build even if an error occurred', async () => {
		await copy(path.join(SAMPLES_DIR, 'error'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			plugins: {
				load() {
					watcher.close();
				}
			},
			output: {
				file: BUNDLE_FILE,
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
				atomicWriteFileSync(ENTRY_FILE, 'export default 44;');
				await wait(400);
				assert.deepStrictEqual(events, ['START', 'BUNDLE_START']);
			}
		]);
	});

	it('stops watching files that are no longer part of the graph', async () => {
		await copy(path.join(SAMPLES_DIR, 'dependency'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 43);
				atomicWriteFileSync(ENTRY_FILE, 'export default 42;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.strictEqual(run(BUNDLE_FILE), 42);
				let unexpectedEvent = false;
				watcher.once('event', event => {
					unexpectedEvent = event;
				});
				atomicWriteFileSync(path.join(INPUT_DIR, 'dep.js'), '= invalid');
				await wait(400);
				assert.strictEqual(unexpectedEvent, false);
			}
		]);
	});

	it('refuses to watch the output file (#15)', async () => {
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(ENTRY_FILE, `import '../output/bundle.js'`);
			},
			'START',
			'BUNDLE_START',
			'ERROR:Cannot import the generated bundle',
			'END',
			() => {
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('ignores files that are not specified in options.watch.include, if given', async () => {
		await copy(path.join(SAMPLES_DIR, 'ignored'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				include: [path.join(INPUT_DIR, '+(main|foo).js')]
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.deepStrictEqual(run(BUNDLE_FILE), {
					foo: 'foo-1',
					bar: 'bar-1'
				});
				atomicWriteFileSync(path.join(INPUT_DIR, 'foo.js'), `export default 'foo-2';`);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.deepStrictEqual(run(BUNDLE_FILE), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				let unexpectedEvent = false;
				watcher.once('event', event => {
					unexpectedEvent = event;
				});
				atomicWriteFileSync(path.join(INPUT_DIR, 'bar.js'), "export default 'bar-2';");
				await wait(400);
				assert.deepStrictEqual(run(BUNDLE_FILE), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				assert.strictEqual(unexpectedEvent, false);
			}
		]);
	});

	it('ignores files that are specified in options.watch.exclude, if given', async () => {
		await copy(path.join(SAMPLES_DIR, 'ignored'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				exclude: [path.join(INPUT_DIR, 'bar.js')]
			}
		});
		return sequence(watcher, [
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.deepStrictEqual(run(BUNDLE_FILE), {
					foo: 'foo-1',
					bar: 'bar-1'
				});
				atomicWriteFileSync(path.join(INPUT_DIR, 'foo.js'), `export default 'foo-2';`);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			async () => {
				assert.deepStrictEqual(run(BUNDLE_FILE), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				let unexpectedEvent = false;
				watcher.once('event', event => {
					unexpectedEvent = event;
				});
				atomicWriteFileSync(path.join(INPUT_DIR, 'bar.js'), "export default 'bar-2';");
				await wait(400);
				assert.deepStrictEqual(run(BUNDLE_FILE), {
					foo: 'foo-2',
					bar: 'bar-1'
				});
				assert.strictEqual(unexpectedEvent, false);
			}
		]);
	});

	it('only rebuilds the appropriate configs', async () => {
		await copy(path.join(SAMPLES_DIR, 'multiple'), INPUT_DIR);
		await wait(100);
		watcher = rollup.watch([
			{
				input: path.join(INPUT_DIR, 'main1.js'),
				output: {
					file: path.join(OUTPUT_DIR, 'bundle1.js'),
					format: 'cjs',
					exports: 'auto'
				}
			},
			{
				input: path.join(INPUT_DIR, 'main2.js'),
				output: {
					file: path.join(OUTPUT_DIR, 'bundle2.js'),
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
				assert.deepStrictEqual(run(path.join(OUTPUT_DIR, 'bundle1.js')), 42);
				assert.deepStrictEqual(run(path.join(OUTPUT_DIR, 'bundle2.js')), 43);
				atomicWriteFileSync(path.join(INPUT_DIR, 'main2.js'), 'export default 44');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.deepStrictEqual(run(path.join(OUTPUT_DIR, 'bundle1.js')), 42);
				assert.deepStrictEqual(run(path.join(OUTPUT_DIR, 'bundle2.js')), 44);
			}
		]);
	});

	it('allows watching only some configs', async () => {
		await copy(path.join(SAMPLES_DIR, 'multiple'), INPUT_DIR);
		await wait(100);
		watcher = rollup.watch([
			{
				input: path.join(INPUT_DIR, 'main1.js'),
				watch: false,
				output: {
					file: path.join(OUTPUT_DIR, 'bundle1.js'),
					format: 'cjs',
					exports: 'auto'
				}
			},
			{
				input: path.join(INPUT_DIR, 'main2.js'),
				output: {
					file: path.join(OUTPUT_DIR, 'bundle2.js'),
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
				assert.strictEqual(
					existsSync(path.resolve(__dirname, path.join(OUTPUT_DIR, 'bundle1.js'))),
					false
				);
				assert.strictEqual(
					existsSync(path.resolve(__dirname, path.join(OUTPUT_DIR, 'bundle2.js'))),
					true
				);
				assert.deepStrictEqual(run(path.join(OUTPUT_DIR, 'bundle2.js')), 43);
			}
		]);
	});

	it('respects output.globals', async () => {
		await copy(path.join(SAMPLES_DIR, 'globals'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				const generated = readFileSync(BUNDLE_FILE, {
					encoding: 'utf8'
				});
				assert.ok(/jQuery/.test(generated));
			}
		]);
	});

	it('treats filenames literally, not as globs', async () => {
		await copy(path.join(SAMPLES_DIR, 'non-glob'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(path.join(INPUT_DIR, '[foo]/bar.js'), `export const bar = 43;`);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 43);
			}
		]);
	});

	it('updates the right hashes on dependency changes', async () => {
		let dynamicName;
		let staticName;
		let chunkName;
		await copy(path.join(SAMPLES_DIR, 'hashing'), INPUT_DIR);
		watcher = rollup.watch({
			input: [path.join(INPUT_DIR, 'main-static.js'), path.join(INPUT_DIR, 'main-dynamic.js')],
			output: {
				dir: OUTPUT_DIR,
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
				[dynamicName, staticName, chunkName] = readdirSync(OUTPUT_DIR).sort();
				rmSync(OUTPUT_DIR, {
					force: true,
					recursive: true
				});

				// this should only update the hash of that particular entry point
				atomicWriteFileSync(
					path.join(INPUT_DIR, 'main-static.js'),
					"import {value} from './shared';\nexport default 2 * value;"
				);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				const [newDynamicName, newStaticName, newChunkName] = readdirSync(OUTPUT_DIR).sort();
				rmSync(OUTPUT_DIR, {
					force: true,
					recursive: true
				});
				assert.notEqual(newStaticName, staticName);
				assert.strictEqual(newDynamicName, dynamicName);
				assert.strictEqual(newChunkName, chunkName);
				staticName = newStaticName;

				// this should update all hashes
				atomicWriteFileSync(path.join(INPUT_DIR, 'shared.js'), 'export const value = 42;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				const [newDynamicName, newStaticName, newChunkName] = readdirSync(OUTPUT_DIR).sort();
				assert.notEqual(newStaticName, staticName);
				assert.notEqual(newDynamicName, dynamicName);
				assert.notEqual(newChunkName, chunkName);
			}
		]);
	});

	it('runs transforms again on previously erroring files that were changed back', async () => {
		const brokenFiles = new Set();
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		const INITIAL_CONTENT = 'export default 42;';
		atomicWriteFileSync(ENTRY_FILE, INITIAL_CONTENT);
		watcher = rollup.watch({
			input: ENTRY_FILE,
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
				file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(ENTRY_FILE, 'export default "broken";');
			},
			'START',
			'BUNDLE_START',
			'ERROR:Broken in transform',
			() => {
				atomicWriteFileSync(ENTRY_FILE, INITIAL_CONTENT);
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(run(BUNDLE_FILE), 42);
			}
		]);
	});

	it('skips filesystem writes when configured', async () => {
		let watchChangeCnt = 0;
		await copy(path.join(SAMPLES_DIR, 'skip-writes'), INPUT_DIR);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
				format: 'cjs',
				exports: 'auto'
			},
			watch: {
				skipWrite: true
			},
			plugins: {
				watchChange(id) {
					watchChangeCnt++;
					assert.strictEqual(id, ENTRY_FILE);
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
				assert.strictEqual(existsSync(BUNDLE_FILE), false);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(existsSync(BUNDLE_FILE), false);
				assert.strictEqual(watchChangeCnt, 1);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			'END',
			() => {
				assert.strictEqual(existsSync(BUNDLE_FILE), false);
				assert.strictEqual(watchChangeCnt, 2);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
			},
			'START',
			'BUNDLE_START',
			'BUNDLE_END',
			// 'END',
			event => {
				assert.strictEqual(existsSync(BUNDLE_FILE), false);
				assert.strictEqual(watchChangeCnt, 3);
				// still aware of its output destination
				assert.strictEqual(event.output[0], path.resolve(BUNDLE_FILE));
			}
		]);
	});

	it('rebuilds immediately by default', async () => {
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		await wait(300);
		watcher = rollup.watch({
			input: ENTRY_FILE,
			output: {
				file: BUNDLE_FILE,
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
					assert.strictEqual(run(BUNDLE_FILE), 42);
					atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
					startTime = hrtime();
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), 43);
					const timeDiff = getTimeDiffInMs(startTime);
					assert.ok(timeDiff < 400, `Time difference ${timeDiff} < 400`);
				}
			],
			0
		);
	}).retries(1);

	it('observes configured build delays', async () => {
		await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
		watcher = rollup.watch(
			[
				{
					input: ENTRY_FILE,
					output: {
						file: BUNDLE_FILE,
						format: 'cjs',
						exports: 'auto'
					}
				},
				{
					input: ENTRY_FILE,
					watch: { clearScreen: true },
					output: {
						file: BUNDLE_FILE,
						format: 'cjs',
						exports: 'auto'
					}
				},
				{
					input: ENTRY_FILE,
					watch: { buildDelay: 1000 },
					output: {
						file: BUNDLE_FILE,
						format: 'cjs',
						exports: 'auto'
					}
				},
				{
					input: ENTRY_FILE,
					watch: { buildDelay: 50 },
					output: {
						file: BUNDLE_FILE,
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
				assert.strictEqual(run(BUNDLE_FILE), 42);
				atomicWriteFileSync(ENTRY_FILE, 'export default 43;');
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
				assert.strictEqual(run(BUNDLE_FILE), 43);
				const timeDiff = getTimeDiffInMs(startTime);
				assert.ok(timeDiff > 1000, `Time difference ${timeDiff} > 1000`);
			}
		]);
	});

	describe('addWatchFile', () => {
		it('supports adding additional watch files in plugin hooks', async () => {
			const watchChangeIds = new Set();
			const buildEndFile = path.resolve(path.join(INPUT_DIR, 'buildEnd'));
			const buildStartFile = path.resolve(path.join(INPUT_DIR, 'buildStart'));
			const generateBundleFile = path.resolve(path.join(INPUT_DIR, 'generateBUndle'));
			const loadFile = path.resolve(path.join(INPUT_DIR, 'load'));
			const moduleParsedFile = path.resolve(path.join(INPUT_DIR, 'moduleParsed'));
			const renderChunkFile = path.resolve(path.join(INPUT_DIR, 'renderChunk'));
			const renderStartFile = path.resolve(path.join(INPUT_DIR, 'renderStart'));
			const resolveIdFile = path.resolve(path.join(INPUT_DIR, 'resolveId'));
			const transformFile = path.resolve(path.join(INPUT_DIR, 'transform'));
			const writeBundleFile = path.resolve(path.join(INPUT_DIR, 'writeBundle'));
			const watchFiles = [
				buildEndFile,
				buildStartFile,
				generateBundleFile,
				loadFile,
				moduleParsedFile,
				renderChunkFile,
				renderStartFile,
				resolveIdFile,
				transformFile,
				writeBundleFile
			];
			await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
			await Promise.all(watchFiles.map(file => writeFile(file, 'initial')));

			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					buildEnd() {
						this.addWatchFile(buildEndFile);
					},
					buildStart() {
						this.addWatchFile(buildStartFile);
					},
					generateBundle() {
						this.addWatchFile(generateBundleFile);
					},
					load() {
						this.addWatchFile(loadFile);
					},
					moduleParsed() {
						this.addWatchFile(moduleParsedFile);
					},
					renderChunk() {
						this.addWatchFile(renderChunkFile);
					},
					renderStart() {
						this.addWatchFile(renderStartFile);
					},
					resolveId() {
						this.addWatchFile(resolveIdFile);
					},
					transform() {
						this.addWatchFile(transformFile);
					},
					writeBundle() {
						this.addWatchFile(writeBundleFile);
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
					assert.strictEqual(run(BUNDLE_FILE), 42);
					// sometimes the watcher is triggered during the initial run
					watchChangeIds.clear();

					await Promise.all(watchFiles.map(file => writeFile(file, 'changed')));
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), 42);
					assert.deepStrictEqual([...watchChangeIds].sort(), watchFiles.sort());
				}
			]);
		});

		it('respects changed watched files in the load hook', async () => {
			const WATCHED_ID = path.join(INPUT_DIR, 'watched');
			await copy(path.join(SAMPLES_DIR, 'watch-files'), INPUT_DIR);
			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
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
					assert.strictEqual(run(BUNDLE_FILE), 'initial');
					atomicWriteFileSync(WATCHED_ID, 'next');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), 'next');
				}
			]);
		});

		it('respects changed watched files in the transform hook and removes them if they are no longer watched', async () => {
			const WATCHED_ID = path.join(INPUT_DIR, 'watched');
			let addWatchFile = true;
			await copy(path.join(SAMPLES_DIR, 'watch-files'), INPUT_DIR);
			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
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
					assert.strictEqual(run(BUNDLE_FILE), 'initial');
					addWatchFile = false;
					atomicWriteFileSync(WATCHED_ID, 'next');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				async () => {
					assert.strictEqual(run(BUNDLE_FILE), 'next');
					atomicWriteFileSync(WATCHED_ID, 'other');
					events.length = 0;
					await wait(400);
					assert.deepStrictEqual(events, []);
				}
			]);
		});

		it('respects changed watched modules that are already part of the graph in the transform hook', async () => {
			await copy(path.join(SAMPLES_DIR, 'dependencies'), INPUT_DIR);
			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform(code, id) {
						if (id.endsWith('dep1.js')) {
							this.addWatchFile(path.resolve(path.join(INPUT_DIR, 'dep2.js')));
							const text = readFileSync(path.join(INPUT_DIR, 'dep2.js')).toString().trim();
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
					assert.strictEqual(run(BUNDLE_FILE), `dep1: "export default 'dep2';", dep2: "dep2"`);
					atomicWriteFileSync(path.join(INPUT_DIR, 'dep2.js'), 'export default "next";');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), `dep1: "export default "next";", dep2: "next"`);
				}
			]);
		});

		it('respects changed watched directories in the transform hook', async () => {
			const WATCHED_ID = path.join(INPUT_DIR, 'watched');
			await copy(path.join(SAMPLES_DIR, 'watch-files'), INPUT_DIR);
			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform() {
						this.addWatchFile(INPUT_DIR);
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
					assert.strictEqual(run(BUNDLE_FILE), true);
					unlinkSync(WATCHED_ID);
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), false);
					watcher.close();
				}
			]);
		});

		it('respects initially missing added watched files', async () => {
			await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform() {
						this.addWatchFile(path.join(INPUT_DIR, 'dep'));
						return `export default ${existsSync(path.join(INPUT_DIR, 'dep'))}`;
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), false);
					atomicWriteFileSync(path.join(INPUT_DIR, 'dep'), '');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), true);
				}
			]);
		});

		it('respects unlinked and re-added watched files', async () => {
			await copy(path.join(SAMPLES_DIR, 'basic'), INPUT_DIR);
			await writeFile(path.join(INPUT_DIR, 'dep'), '');
			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					transform() {
						this.addWatchFile(path.join(INPUT_DIR, 'dep'));
						return `export default ${existsSync(path.join(INPUT_DIR, 'dep'))}`;
					}
				}
			});
			return sequence(watcher, [
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), true);
					unlinkSync(path.join(INPUT_DIR, 'dep'));
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), false);
					atomicWriteFileSync(path.join(INPUT_DIR, 'dep'), '');
				},
				'START',
				'BUNDLE_START',
				'BUNDLE_END',
				'END',
				() => {
					assert.strictEqual(run(BUNDLE_FILE), true);
				}
			]);
		});

		it('does not rerun the transform hook if a non-watched change triggered the re-run', async () => {
			const WATCHED_ID = path.join(INPUT_DIR, 'watched');
			let transformRuns = 0;
			await copy(path.join(SAMPLES_DIR, 'watch-files'), INPUT_DIR);
			await wait(100);
			await writeFile(path.join(INPUT_DIR, 'alsoWatched'), 'initial');
			watcher = rollup.watch({
				input: ENTRY_FILE,
				output: {
					file: BUNDLE_FILE,
					format: 'cjs',
					exports: 'auto'
				},
				plugins: {
					buildStart() {
						this.addWatchFile(path.join(INPUT_DIR, 'alsoWatched'));
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
					atomicWriteFileSync(path.join(INPUT_DIR, 'alsoWatched'), 'next');
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
	const allEvents = [];
	const formatEvents = () =>
		`\nHandled events:\n${handledEvents.join('\n')}\n\nWatcher events:\n${allEvents.join('\n')}`;
	watcher.on('event', event => allEvents.push(JSON.stringify(event)));
	const sequencePromise = new Promise((fulfil, reject) => {
		function go(event) {
			const next = events.shift();
			if (!next) {
				handledEvents.push('DONE');
				watcher.close();
				fulfil();
			} else if (typeof next === 'string') {
				handledEvents.push(next);
				const [eventCode, ...eventMessageParts] = next.split(':');
				const eventMessage = eventMessageParts.join(':');
				watcher.once('event', event => {
					if (event.code !== eventCode) {
						watcher.close();
						if (event.code === 'ERROR') console.log(event.error);
						reject(new Error(`Expected ${eventCode} event, got ${event.code}.${formatEvents()}`));
					} else if (
						eventCode === 'ERROR' &&
						eventMessage &&
						event.error.message !== eventMessage
					) {
						reject(
							new Error(
								`Expected to throw "${eventMessage}" but got "${event.error.message}".${formatEvents()}`
							)
						);
					} else {
						go(event);
					}
				});
			} else {
				// "next" is a function
				// This solves two problems:
				// - Sometimes a change in the function does not trigger a rebuild if
				//   it happens too quickly, i.e. shorter than 300ms after the previous
				//   change.
				// - On the flipside, sometimes a single change triggers two builds.
				//   In that case, waiting here "swallows" the second build.
				wait(timeout)
					.then(() => {
						handledEvents.push(`fn: ${JSON.stringify(event)}`);
						next(event);
						go();
					})
					.catch(error => {
						watcher.close();
						error.message += formatEvents();
						reject(error);
					});
			}
		}

		go();
	});

	return withTimeout(sequencePromise, 20_000, () => {
		throw new Error(`Test timed out.\nHandled events:\n${handledEvents.join('\n')}`);
	}).then(() => wait(100));
}

function getTimeDiffInMs(previous) {
	const [seconds, nanoseconds] = hrtime(previous);
	return seconds * 1e3 + nanoseconds / 1e6;
}
