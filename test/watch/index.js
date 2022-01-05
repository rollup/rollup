const assert = require('assert');
const path = require('path');
const sander = require('sander');
const rollup = require('../../dist/rollup');
const { atomicWriteFileSync } = require('../utils');

const cwd = process.cwd();

function wait(ms) {
	return new Promise(fulfil => {
		setTimeout(fulfil, ms);
	});
}

describe('rollup.watch', () => {
	let watcher;

	beforeEach(() => {
		process.chdir(cwd);
		return sander.rimraf('test/_tmp');
	});

	afterEach(() => {
		if (watcher) {
			watcher.close();
			watcher = null;
		}
	});

	function run(file) {
		const resolved = require.resolve(file);
		delete require.cache[resolved];
		return require(resolved);
	}

	function sequence(watcher, events, timeout = 300) {
		return new Promise((fulfil, reject) => {
			function go(event) {
				const next = events.shift();

				if (!next) {
					watcher.close();
					fulfil();
				} else if (typeof next === 'string') {
					watcher.once('event', event => {
						if (event.code !== next) {
							watcher.close();
							if (event.code === 'ERROR') console.log(event.error);
							reject(new Error(`Expected ${next} event, got ${event.code}`));
						} else {
							go(event);
						}
					});
				} else {
					Promise.resolve()
						.then(() => wait(timeout)) // gah, this appears to be necessary to fix random errors
						.then(() => next(event))
						.then(go)
						.catch(error => {
							watcher.close();
							reject(error);
						});
				}
			}

			go();
		}).then(() => wait(100));
	}

	function getTimeDiffInMs(previous) {
		const [seconds, nanoseconds] = process.hrtime(previous);
		return seconds * 1e3 + nanoseconds / 1e6;
	}

	it('watches a file and triggers reruns if necessary', () => {
		let triggerRestart = false;

		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
				watcher = rollup.watch({
					input: 'test/_tmp/input/main.js',
					plugins: {
						options(options) {
							assert.strictEqual(this.meta.watchMode, true, 'watchMode in options');
						},
						transform(code) {
							assert.strictEqual(this.meta.watchMode, true, 'watchMode in transform');
							if (triggerRestart) {
								triggerRestart = false;
								return wait(100)
									.then(() => atomicWriteFileSync('test/_tmp/input/main.js', 'export default 44;'))
									.then(() => wait(100))
									.then(() => code);
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
	});

	it('does not fail for virtual files', () => {
		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
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
	});

	it('passes file events to the watchChange plugin hook once for each change', async () => {
		let watchChangeCnt = 0;
		await sander.copydir('test/watch/samples/basic').to('test/_tmp/input');
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
					assert.strictEqual(id, path.resolve('test/_tmp/input/main.js'));
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
		const WATCHED_ID = path.resolve('test/_tmp/input/watched');
		const events = [];
		let ids;
		const expectedIds = [WATCHED_ID, path.resolve('test/_tmp/input/main.js')];
		await sander.copydir('test/watch/samples/watch-files').to('test/_tmp/input');
		await sander.unlink(WATCHED_ID);
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
				sander.unlinkSync(WATCHED_ID);
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
		const WATCHED_ID = path.resolve('test/_tmp/input/watched');
		const MAIN_ID = path.resolve('test/_tmp/input/main.js');
		let lastEvent = null;
		await sander.copydir('test/watch/samples/watch-files').to('test/_tmp/input');
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
				sander.unlinkSync(WATCHED_ID);
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
				sander.unlinkSync(WATCHED_ID);
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
	}).timeout(20000);

	it('calls closeWatcher plugin hook', () => {
		let calls = 0;
		let ctx1;
		let ctx2;
		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
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
								ctx1 = this;
							},
							closeWatcher() {
								assert.strictEqual(ctx1, this);
								calls++;
							}
						},
						{
							buildStart() {
								ctx2 = this;
							},
							closeWatcher() {
								assert.strictEqual(ctx2, this);
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
						assert.ok(ctx1);
						assert.ok(ctx2);
						watcher.once('close', () => {
							assert.strictEqual(calls, 2);
						});
						watcher.close();
					}
				]);
			});
	});

	it('watches a file in code-splitting mode', () => {
		return sander
			.copydir('test/watch/samples/code-splitting')
			.to('test/_tmp/input')
			.then(() => {
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
	});

	it('watches a file in code-splitting mode with an input object', () => {
		return sander
			.copydir('test/watch/samples/code-splitting')
			.to('test/_tmp/input')
			.then(() => {
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
	});

	it('recovers from an error', () => {
		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
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
					'ERROR',
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
	});

	it('recovers from an error on initial build', () => {
		return sander
			.copydir('test/watch/samples/error')
			.to('test/_tmp/input')
			.then(() => {
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
					'ERROR',
					() => {
						assert.strictEqual(sander.existsSync('../_tmp/output/bundle.js'), false);
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
	});

	it('recovers from a plugin error on initial build', () => {
		let count = 0;
		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
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
					'ERROR',
					() => {
						assert.strictEqual(sander.existsSync('../_tmp/output/bundle.js'), false);
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
	});

	it('recovers from an error even when erroring entry was "renamed" (#38)', () => {
		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
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
						sander.unlinkSync('test/_tmp/input/main.js');
						atomicWriteFileSync('test/_tmp/input/main.js', 'export nope;');
					},
					'START',
					'BUNDLE_START',
					'ERROR',
					() => {
						sander.unlinkSync('test/_tmp/input/main.js');
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
	});

	it('recovers from an error even when erroring dependency was "renamed" (#38)', () => {
		return sander
			.copydir('test/watch/samples/dependency')
			.to('test/_tmp/input')
			.then(() => {
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
						sander.unlinkSync('test/_tmp/input/dep.js');
						atomicWriteFileSync('test/_tmp/input/dep.js', 'export nope;');
					},
					'START',
					'BUNDLE_START',
					'ERROR',
					() => {
						sander.unlinkSync('test/_tmp/input/dep.js');
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
	});

	it('handles closing the watcher during a build', () => {
		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
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
					() => {
						atomicWriteFileSync('test/_tmp/input/main.js', 'export default 44;');
						return wait(400).then(() => assert.deepStrictEqual(events, ['START', 'BUNDLE_START']));
					}
				]);
			});
	});

	it('handles closing the watcher during a build even if an error occurred', () => {
		return sander
			.copydir('test/watch/samples/error')
			.to('test/_tmp/input')
			.then(() => {
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
					() => {
						atomicWriteFileSync('test/_tmp/input/main.js', 'export default 44;');
						return wait(400).then(() => assert.deepStrictEqual(events, ['START', 'BUNDLE_START']));
					}
				]);
			});
	});

	it('stops watching files that are no longer part of the graph', () => {
		return sander
			.copydir('test/watch/samples/dependency')
			.to('test/_tmp/input')
			.then(() => {
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
					() => {
						assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
						let unexpectedEvent = false;
						watcher.once('event', event => {
							unexpectedEvent = event;
						});
						atomicWriteFileSync('test/_tmp/input/dep.js', '= invalid');
						return wait(400).then(() => assert.strictEqual(unexpectedEvent, false));
					}
				]);
			});
	});

	it('refuses to watch the output file (#15)', () => {
		return sander
			.copydir('test/watch/samples/basic')
			.to('test/_tmp/input')
			.then(() => {
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
					'ERROR',
					event => {
						assert.strictEqual(event.error.message, 'Cannot import the generated bundle');
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
	});

	it('ignores files that are not specified in options.watch.include, if given', () => {
		return sander
			.copydir('test/watch/samples/ignored')
			.to('test/_tmp/input')
			.then(() => {
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
					() => {
						assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
							foo: 'foo-2',
							bar: 'bar-1'
						});
						let unexpectedEvent = false;
						watcher.once('event', event => {
							unexpectedEvent = event;
						});
						atomicWriteFileSync('test/_tmp/input/bar.js', "export default 'bar-2';");
						return wait(400).then(() => {
							assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-2',
								bar: 'bar-1'
							});
							assert.strictEqual(unexpectedEvent, false);
						});
					}
				]);
			});
	});

	it('ignores files that are specified in options.watch.exclude, if given', () => {
		return sander
			.copydir('test/watch/samples/ignored')
			.to('test/_tmp/input')
			.then(() => {
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
					() => {
						assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
							foo: 'foo-2',
							bar: 'bar-1'
						});
						let unexpectedEvent = false;
						watcher.once('event', event => {
							unexpectedEvent = event;
						});
						atomicWriteFileSync('test/_tmp/input/bar.js', "export default 'bar-2';");
						return wait(400).then(() => {
							assert.deepStrictEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-2',
								bar: 'bar-1'
							});
							assert.strictEqual(unexpectedEvent, false);
						});
					}
				]);
			});
	});

	it('only rebuilds the appropriate configs', () => {
		return sander
			.copydir('test/watch/samples/multiple')
			.to('test/_tmp/input')
			.then(() => wait(100))
			.then(() => {
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
	});

	it('allows watching only some configs', () => {
		return sander
			.copydir('test/watch/samples/multiple')
			.to('test/_tmp/input')
			.then(() => wait(100))
			.then(() => {
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
						assert.strictEqual(
							sander.existsSync(path.resolve(__dirname, '../_tmp/output/bundle1.js')),
							false
						);
						assert.strictEqual(
							sander.existsSync(path.resolve(__dirname, '../_tmp/output/bundle2.js')),
							true
						);
						assert.deepStrictEqual(run('../_tmp/output/bundle2.js'), 43);
					}
				]);
			});
	});

	it('respects output.globals', () => {
		return sander
			.copydir('test/watch/samples/globals')
			.to('test/_tmp/input')
			.then(() => {
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
						const generated = sander.readFileSync('test/_tmp/output/bundle.js', {
							encoding: 'utf-8'
						});
						assert.ok(/jQuery/.test(generated));
					}
				]);
			});
	});

	it('treats filenames literally, not as globs', () => {
		return sander
			.copydir('test/watch/samples/non-glob')
			.to('test/_tmp/input')
			.then(() => {
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
	});

	it('updates the right hashes on dependency changes', () => {
		let dynamicName;
		let staticName;
		let chunkName;
		return sander
			.copydir('test/watch/samples/hashing')
			.to('test/_tmp/input')
			.then(() => {
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
						[dynamicName, staticName, chunkName] = sander.readdirSync('test/_tmp/output').sort();
						sander.rimrafSync('test/_tmp/output');

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
						const [newDynamicName, newStaticName, newChunkName] = sander
							.readdirSync('test/_tmp/output')
							.sort();
						sander.rimrafSync('test/_tmp/output');
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
						const [newDynamicName, newStaticName, newChunkName] = sander
							.readdirSync('test/_tmp/output')
							.sort();
						assert.notEqual(newStaticName, staticName);
						assert.notEqual(newDynamicName, dynamicName);
						assert.notEqual(newChunkName, chunkName);
					}
				]);
			});
	});

	it('runs transforms again on previously erroring files that were changed back', () => {
		const brokenFiles = new Set();
		const INITIAL_CONTENT = 'export default 42;';
		sander.writeFileSync('test/_tmp/input/main.js', INITIAL_CONTENT);
		watcher = rollup.watch({
			input: 'test/_tmp/input/main.js',
			plugins: {
				transform(code, id) {
					if (code.includes('broken')) {
						brokenFiles.add(id);
						throw new Error('Broken in transform');
					} else {
						brokenFiles.delete(id);
					}
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
			'ERROR',
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

	it('skips filesystem writes when configured', () => {
		let watchChangeCnt = 0;
		return sander
			.copydir('test/watch/samples/skip-writes')
			.to('test/_tmp/input')
			.then(() => {
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
							assert.strictEqual(id, path.resolve('test/_tmp/input/main.js'));
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
						assert.strictEqual(sander.existsSync('../_tmp/output/bundle.js'), false);
						atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
					},
					'START',
					'BUNDLE_START',
					'BUNDLE_END',
					'END',
					() => {
						assert.strictEqual(sander.existsSync('../_tmp/output/bundle.js'), false);
						assert.strictEqual(watchChangeCnt, 1);
						atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
					},
					'START',
					'BUNDLE_START',
					'BUNDLE_END',
					'END',
					() => {
						assert.strictEqual(sander.existsSync('../_tmp/output/bundle.js'), false);
						assert.strictEqual(watchChangeCnt, 2);
						atomicWriteFileSync('test/_tmp/input/main.js', 'export default 43;');
					},
					'START',
					'BUNDLE_START',
					'BUNDLE_END',
					// 'END',
					evt => {
						assert.strictEqual(sander.existsSync('../_tmp/output/bundle.js'), false);
						assert.strictEqual(watchChangeCnt, 3);
						// still aware of its output destination
						assert.strictEqual(evt.output[0], path.resolve('test/_tmp/output/bundle.js'));
					}
				]);
			});
	});

	it('rebuilds immediately by default', async () => {
		await sander.copydir('test/watch/samples/basic').to('test/_tmp/input');
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
					startTime = process.hrtime();
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
	});

	it('observes configured build delays', async () => {
		await sander.copydir('test/watch/samples/basic').to('test/_tmp/input');
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
				startTime = process.hrtime();
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
		it('supports adding additional watch files in plugin hooks', () => {
			const watchChangeIds = new Set();
			const buildStartFile = path.resolve('test/_tmp/input/buildStart');
			const loadFile = path.resolve('test/_tmp/input/load');
			const resolveIdFile = path.resolve('test/_tmp/input/resolveId');
			const transformFile = path.resolve('test/_tmp/input/transform');
			const watchFiles = [buildStartFile, loadFile, resolveIdFile, transformFile];
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
					for (const file of watchFiles) sander.writeFileSync(file, 'initial');
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
						() => {
							assert.strictEqual(run('../_tmp/output/bundle.js'), 42);
							// sometimes the watcher is triggered during the initial run
							watchChangeIds.clear();
							for (const file of watchFiles) sander.writeFileSync(file, 'changed');
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
		});

		it('respects changed watched files in the load hook', () => {
			const WATCHED_ID = path.resolve('test/_tmp/input/watched');
			return sander
				.copydir('test/watch/samples/watch-files')
				.to('test/_tmp/input')
				.then(() => {
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
								return `export default "${sander.readFileSync(WATCHED_ID).toString().trim()}"`;
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
		});

		it('respects changed watched files in the transform hook and removes them if they are no longer watched', () => {
			const WATCHED_ID = path.resolve('test/_tmp/input/watched');
			let addWatchFile = true;
			return sander
				.copydir('test/watch/samples/watch-files')
				.to('test/_tmp/input')
				.then(() => {
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
									return `export const value = "${sander
										.readFileSync(WATCHED_ID)
										.toString()
										.trim()}"`;
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
						() => {
							assert.strictEqual(run('../_tmp/output/bundle.js'), 'next');
							atomicWriteFileSync(WATCHED_ID, 'other');
							events.length = 0;
							return wait(400).then(() => assert.deepStrictEqual(events, []));
						}
					]);
				});
		});

		it('respects changed watched modules that are already part of the graph in the transform hook', () => {
			return sander
				.copydir('test/watch/samples/dependencies')
				.to('test/_tmp/input')
				.then(() => {
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
									this.addWatchFile(path.resolve('test/_tmp/input/dep2.js'));
									const text = sander.readFileSync('test/_tmp/input/dep2.js').toString().trim();
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
		});

		it('respects changed watched directories in the transform hook', () => {
			const WATCHED_ID = path.resolve('test/_tmp/input/watched');
			return sander
				.copydir('test/watch/samples/watch-files')
				.to('test/_tmp/input')
				.then(() => {
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
								return `export default ${sander.existsSync(WATCHED_ID)}`;
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
							sander.unlinkSync(WATCHED_ID);
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
		});

		it('respects initially missing added watched files', () => {
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
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
								return `export default ${sander.existsSync('test/_tmp/input/dep')}`;
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
		});

		it('respects unlinked and re-added watched files', () => {
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
					sander.writeFileSync('test/_tmp/input/dep', '');
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
								return `export default ${sander.existsSync('test/_tmp/input/dep')}`;
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
							sander.unlinkSync('test/_tmp/input/dep');
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
		});

		it('does not rerun the transform hook if a non-watched change triggered the re-run', () => {
			const WATCHED_ID = path.resolve('test/_tmp/input/watched');
			let transformRuns = 0;
			return sander
				.copydir('test/watch/samples/watch-files')
				.to('test/_tmp/input')
				.then(() => wait(100))
				.then(() => {
					sander.writeFileSync('test/_tmp/input/alsoWatched', 'initial');
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
								return `export default "${sander.readFileSync(WATCHED_ID).toString().trim()}"`;
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
}).timeout(20000);
