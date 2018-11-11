const path = require('path');
const assert = require('assert');
const sander = require('sander');
const buble = require('buble');
const { exec } = require('child_process');
const {
	normaliseOutput,
	runTestSuiteWithSamples,
	assertDirectoriesAreEqual
} = require('../utils.js');

const cwd = process.cwd();

sander.rimrafSync(__dirname, 'node_modules');
sander.copydirSync(__dirname, 'node_modules_rename_me').to(__dirname, 'node_modules');

runTestSuiteWithSamples(
	'cli',
	path.resolve(__dirname, 'samples'),
	(dir, config) => {
		(config.skip ? it.skip : config.solo ? it.only : it)(
			path.basename(dir) + ': ' + config.description,
			done => {
				process.chdir(config.cwd || dir);

				const command = 'node ' + path.resolve(__dirname, '../../bin') + path.sep + config.command;

				exec(command, {}, (err, code, stderr) => {
					if (err) {
						if (config.error) {
							const shouldContinue = config.error(err);
							if (!shouldContinue) return done();
						} else {
							throw err;
						}
					}

					if ('stderr' in config) {
						const shouldContinue = config.stderr(stderr.trim());
						if (!shouldContinue) return done();
					} else if (stderr) {
						console.error(stderr);
					}

					let unintendedError;

					if (config.execute) {
						try {
							if (config.buble) {
								code = buble.transform(code, {
									transforms: { modules: false }
								}).code;
							}

							const fn = new Function('require', 'module', 'exports', 'assert', code);
							const module = {
								exports: {}
							};
							fn(require, module, module.exports, assert);

							if (config.error) {
								unintendedError = new Error('Expected an error while executing output');
							}

							if (config.exports) {
								config.exports(module.exports);
							}
						} catch (err) {
							if (config.error) {
								config.error(err);
							} else {
								unintendedError = err;
							}
						}

						if (config.show || unintendedError) {
							console.log(code + '\n\n\n');
						}

						if (config.solo) console.groupEnd();

						unintendedError ? done(unintendedError) : done();
					} else if (config.result) {
						try {
							config.result(code);
							done();
						} catch (err) {
							done(err);
						}
					} else if (config.test) {
						try {
							config.test();
							done();
						} catch (err) {
							done(err);
						}
					} else if (sander.existsSync('_expected') && sander.statSync('_expected').isDirectory()) {
						try {
							assertDirectoriesAreEqual('_actual', '_expected');
							done();
						} catch (err) {
							done(err);
						}
					} else {
						const expected = sander.readFileSync('_expected.js').toString();
						try {
							assert.equal(normaliseOutput(code), normaliseOutput(expected));
							done();
						} catch (err) {
							done(err);
						}
					}
				});
			}
		);
	},
	() => process.chdir(cwd)
);
