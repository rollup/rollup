const path = require('path');
const assert = require('assert');
const sander = require('sander');
const buble = require('buble');
const rollup = require('../../dist/rollup');
const {
	compareError,
	compareWarnings,
	extend,
	loadConfig
} = require('../utils.js');

const samples = path.resolve(__dirname, 'samples');

describe('function', () => {
	sander.readdirSync(samples).sort().forEach(dir => {
		if (dir[0] === '.') return; // .DS_Store...

		const config = loadConfig(samples + '/' + dir + '/_config.js');
		(config.skip ? it.skip : config.solo ? it.only : it)(dir, () => {
			process.chdir(samples + '/' + dir);

			const warnings = [];
			const captureWarning = msg => warnings.push(msg);

			const options = extend(
				{
					input: samples + '/' + dir + '/main.js',
					onwarn: captureWarning
				},
				config.options
			);

			if (config.solo) console.group(dir);

			return rollup
				.rollup(options)
				.then(bundle => {
					let unintendedError;

					if (config.error) {
						throw new Error('Expected an error while rolling up');
					}

					let result;

					// try to generate output
					return Promise.resolve()
						.then(() => {
							return bundle.generate(
								extend({}, config.bundleOptions, {
									format: 'cjs'
								})
							);
						})
						.then(code => {
							if (config.generateError) {
								unintendedError = new Error(
									'Expected an error while generating output'
								);
							}

							result = code;
						})
						.catch(err => {
							if (config.generateError) {
								compareError(err, config.generateError);
							} else {
								unintendedError = err;
							}
						})
						.then(() => {
							if (unintendedError) throw unintendedError;
							if (config.error || config.generateError) return;

							let code = result.code;

							if (config.buble) {
								code = buble.transform(code, {
									transforms: { modules: false }
								}).code;
							}

							if (config.code) config.code(code);

							const module = {
								exports: {}
							};

							const context = extend(
								{ require, module, assert, exports: module.exports },
								config.context || {}
							);

							const contextKeys = Object.keys(context);
							const contextValues = contextKeys.map(key => context[key]);

							try {
								const fn = new Function(contextKeys, code);
								fn.apply({}, contextValues);

								if (config.runtimeError) {
									unintendedError = new Error(
										'Expected an error while executing output'
									);
								}
							} catch (err) {
								if (config.runtimeError) {
									config.runtimeError(err);
								} else {
									unintendedError = err;
								}
							}

							return Promise.resolve()
							.then(() => {
								if (config.exports && !unintendedError) {
									return config.exports(module.exports);
								}
							})
							.then(() => {
								if (config.bundle && !unintendedError) {
									return config.bundle(bundle);
								}
							})
							.catch(err => {
								if (config.runtimeError) {
									config.runtimeError(err);
								} else {
									unintendedError = err;
								}
							})
							.then(() => {
								if (config.show || unintendedError) {
									console.log(result.code + '\n\n\n');
								}

								if (config.warnings) {
									if (Array.isArray(config.warnings)) {
										compareWarnings(warnings, config.warnings);
									} else {
										config.warnings(warnings);
									}
								} else if (warnings.length) {
									throw new Error(
										`Got unexpected warnings:\n${warnings.map(warning => warning.message).join('\n')}`
									);
								}

								if (config.solo) console.groupEnd();

								if (unintendedError) throw unintendedError;
							});
						});
				})
				.catch(err => {
					if (config.error) {
						compareError(err, config.error);
					} else {
						throw err;
					}
				});
		});
	});
});
