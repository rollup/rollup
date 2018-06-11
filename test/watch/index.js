const assert = require('assert');
const sander = require('sander');
const rollup = require('../../dist/rollup');

const cwd = process.cwd();

function wait(ms) {
	return new Promise(fulfil => {
		setTimeout(fulfil, ms);
	});
}

describe('rollup.watch', () => {
	beforeEach(() => {
		process.chdir(cwd);
		return sander.rimraf('test/_tmp');
	});

	function run(file) {
		const resolved = require.resolve(file);
		delete require.cache[resolved];
		return require(resolved);
	}

	function sequence(watcher, events) {
		return new Promise((fulfil, reject) => {
			function go(event) {
				const next = events.shift();

				if (!next) {
					fulfil();
				} else if (typeof next === 'string') {
					watcher.once('event', event => {
						if (event.code !== next) {
							if (event.code === 'FATAL') {
								console.error(event.error);
							}
							reject(new Error(`Expected ${next} event, got ${event.code}`));
						} else {
							go(event);
						}
					});
				} else {
					Promise.resolve()
						.then(() => wait(100)) // gah, this appears to be necessary to fix random errors
						.then(() => next(event))
						.then(go)
						.catch(reject);
				}
			}

			go();
		});
	}

	describe('fs.watch', () => {
		runTests(false);
	});

	if (!process.env.CI) {
		describe('chokidar', () => {
			runTests(true);
		});
	}

	function runTests(chokidar) {
		it('watches a file', () => {
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 42);
							sander.writeFileSync('test/_tmp/input/main.js', 'export default 43;');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 43);
							watcher.close();
						}
					]);
				});
		});

		it('provides the watcher through the plugin context', () => {
			let events = [];
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						watch: { chokidar },
						plugins: [{
							buildStart (id) {
								if (!this.watcher)
									throw new Error('No Watcher');

								this.watcher.on('event', event => {
									events.push(event);
								});
							}
						}]
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(events.length, 2);
							assert.equal(run('../_tmp/output/bundle.js'), 42);
							sander.writeFileSync('test/_tmp/input/main.js', 'export default 43;');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 43);
							assert.equal(events.length, 8);
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
					const watcher = rollup.watch({
						input: ['test/_tmp/input/main1.js', 'test/_tmp/input/main2.js'],
						output: {
							dir: 'test/_tmp/output',
							format: 'cjs'
						},
						watch: { chokidar },
						experimentalCodeSplitting: true
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/main1.js'), 21);
							assert.equal(run('../_tmp/output/main2.js'), 42);
							sander.writeFileSync('test/_tmp/input/shared.js', 'export const value = 22;');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/main1.js'), 22);
							assert.equal(run('../_tmp/output/main2.js'), 44);
							watcher.close();
						}
					]);
				});
		});

		it('watches a file in code-splitting mode with an input object', () => {
			return sander
				.copydir('test/watch/samples/code-splitting')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: {
							_main_1: 'test/_tmp/input/main1.js',
							'subfolder/_main_2':'test/_tmp/input/main2.js',
						},
						output: {
							dir: 'test/_tmp/output',
							format: 'cjs'
						},
						watch: { chokidar },
						experimentalCodeSplitting: true
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/_main_1.js'), 21);
							assert.equal(run('../_tmp/output/subfolder/_main_2.js'), 42);
							sander.writeFileSync('test/_tmp/input/shared.js', 'export const value = 22;');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/_main_1.js'), 22);
							assert.equal(run('../_tmp/output/subfolder/_main_2.js'), 44);
							watcher.close();
						}
					]);
				});
		});


		it('recovers from an error', () => {
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 42);
							sander.writeFileSync('test/_tmp/input/main.js', 'export nope;');
						},
						'START',
						'BUNDLE_START',
						'ERROR',
						() => {
							sander.writeFileSync('test/_tmp/input/main.js', 'export default 43;');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 43);
							watcher.close();
						}
					]);
				});
		});

		it('recovers from an error even when erroring file was "renamed" (#38)', () => {
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 42);
							sander.unlinkSync('test/_tmp/input/main.js');
							sander.writeFileSync('test/_tmp/input/main.js', 'export nope;');
						},
						'START',
						'BUNDLE_START',
						'ERROR',
						() => {
							sander.unlinkSync('test/_tmp/input/main.js');
							sander.writeFileSync('test/_tmp/input/main.js', 'export default 43;');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 43);
							watcher.close();
						}
					]);
				});
		});

		it('watches and rebuilds transform dependencies', () => {
			return sander
				.copydir('test/watch/samples/transform-dependencies')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						plugins: [{
							transform (code) {
								const dependencies = ['./asdf'];
								const text = sander.readFileSync('test/_tmp/input/asdf').toString();
								return { code: `export default "${text}"`, dependencies };
							}
						}],
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 'asdf');
							sander.unlinkSync('test/_tmp/input/asdf');
							sander.writeFileSync('test/_tmp/input/asdf', 'next');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 'next');
							watcher.close();
						}
					]);
				});
		});

		it('throws if transform dependency doesnt exist', () => {
			return sander
				.copydir('test/watch/samples/transform-dependencies')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						plugins: [{
							transform (code) {
								const dependencies = ['./doesnotexist'];
								const text = sander.readFileSync('test/_tmp/input/asdf').toString();
								return { code: `export default "${text}"`, dependencies };
							}
						}],
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'FATAL',
						event => {
							assert.ok(event.error.message.startsWith('Transform dependency'));
							assert.ok(event.error.message.endsWith('does not exist.'));
							watcher.close();
						}
					]);
				});
		});

		it('watches and rebuilds transform dependencies that are modules', () => {
			return sander
				.copydir('test/watch/samples/transform-dependencies')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						plugins: [{
							transform (code) {
								const dependencies = ['./main.js'];
								const text = sander.readFileSync('test/_tmp/input/main.js').toString().trim();
								return { code: `export default "${text}"`, dependencies };
							}
						}],
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 'export default 42;');
							sander.unlinkSync('test/_tmp/input/main.js');
							sander.writeFileSync('test/_tmp/input/main.js', 'next');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 'next');
							watcher.close();
						}
					]);
				});
		});

		it('watches and rebuilds transform dependencies directories', () => {
			let v = 1;
			return sander
				.copydir('test/watch/samples/transform-dependencies')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						plugins: [{
							transform (code) {
								const dependencies = ['./'];
								return { code: `export default ${v++}`, dependencies };
							}
						}],
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 1);
							sander.unlinkSync('test/_tmp/input/asdf');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 2);
							watcher.close();
						}
					]);
				});
		});

		it('watches and rebuilds transform dependencies created and removed between runs', () => {
			let v = 1;
			return sander
				.copydir('test/watch/samples/transform-dependencies')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						plugins: [{
							transform (code) {
								let dependencies = [];
								if (v === 2)
									dependencies = ['./asdf'];
								return { code: `export default ${v++}`, dependencies };
							}
						}],
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 1);
							sander.unlinkSync('test/_tmp/input/main.js');
							sander.writeFileSync('test/_tmp/input/main.js', 'next');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 2);
							sander.unlinkSync('test/_tmp/input/asdf');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 3);
							sander.writeFileSync('test/_tmp/input/asdf', 'ignored');
							return new Promise(resolve => setTimeout(resolve, 50));
						},
						() => {
							watcher.close();
						}
					]);
				});
		});


		it('refuses to watch the output file (#15)', () => {
			return sander
				.copydir('test/watch/samples/basic')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						watch: { chokidar }
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 42);
							sander.writeFileSync('test/_tmp/input/main.js', `import '../output/bundle.js'`);
						},
						'START',
						'BUNDLE_START',
						'ERROR',
						event => {
							assert.equal(event.error.message, 'Cannot import the generated bundle');
							sander.writeFileSync('test/_tmp/input/main.js', 'export default 43;');
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal(run('../_tmp/output/bundle.js'), 43);
							watcher.close();
						}
					]);
				});
		});

		it('ignores files that are not specified in options.watch.include, if given', () => {
			return sander
				.copydir('test/watch/samples/ignored')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						watch: {
							chokidar,
							include: ['test/_tmp/input/+(main|foo).js']
						}
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-1',
								bar: 'bar-1'
							});
							sander.writeFileSync('test/_tmp/input/foo.js', `export default 'foo-2';`);
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-2',
								bar: 'bar-1'
							});
							sander.writeFileSync('test/_tmp/input/bar.js', `export default 'bar-2';`);
						},
						() => {
							assert.deepEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-2',
								bar: 'bar-1'
							});
							watcher.close();
						}
					]);
				});
		});

		it('ignores files that are specified in options.watch.exclude, if given', () => {
			return sander
				.copydir('test/watch/samples/ignored')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'cjs'
						},
						watch: {
							chokidar,
							exclude: ['test/_tmp/input/bar.js']
						}
					});

					return sequence(watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-1',
								bar: 'bar-1'
							});
							sander.writeFileSync('test/_tmp/input/foo.js', `export default 'foo-2';`);
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-2',
								bar: 'bar-1'
							});
							sander.writeFileSync('test/_tmp/input/bar.js', `export default 'bar-2';`);
						},
						() => {
							assert.deepEqual(run('../_tmp/output/bundle.js'), {
								foo: 'foo-2',
								bar: 'bar-1'
							});
							watcher.close();
						}
					]);
				});
		});

		it('respects output.globals', () => {
			return sander
				.copydir('test/watch/samples/globals')
				.to('test/_tmp/input')
				.then(() => {
					const watcher = rollup.watch({
						input: 'test/_tmp/input/main.js',
						output: {
							file: 'test/_tmp/output/bundle.js',
							format: 'iife',
							globals: {
								jquery: 'jQuery'
							}
						},
						watch: { chokidar },
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
							watcher.close();
						}
					]);
				});
		});
	}
});
