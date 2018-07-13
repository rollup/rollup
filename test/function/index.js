const path = require('path');
const assert = require('assert');
const buble = require('buble');
const rollup = require('../../dist/rollup');
const { compareError, compareWarnings, extend, runTestSuiteWithSamples } = require('../utils.js');

runTestSuiteWithSamples('function', path.resolve(__dirname, 'samples'), (dir, config) => {
	(config.skip ? it.skip : config.solo ? it.only : it)(
		path.basename(dir) + ': ' + config.description,
		() => {
			if (config.solo) console.group(path.basename(dir));

			process.chdir(dir);
			const warnings = [];

			return rollup
				.rollup(
					extend(
						{
							input: dir + '/main.js',
							onwarn: warning => warnings.push(warning)
						},
						config.options || {}
					)
				)
				.then(bundle => {
					let unintendedError;

					if (config.error) {
						throw new Error('Expected an error while rolling up');
					}

					let result;

					return bundle
						.generate(
							extend(
								{
									format: 'cjs'
								},
								(config.options || {}).output || {}
							)
						)
						.then(code => {
							if (config.generateError) {
								unintendedError = new Error('Expected an error while generating output');
							}

							result = code;
						})
						.catch(err => {
							if (config.generateError) {
								compareError(err, config.generateError);
							} else {
								throw err;
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
									unintendedError = new Error('Expected an error while executing output');
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
											`Got unexpected warnings:\n${warnings
												.map(warning => warning.message)
												.join('\n')}`
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
		}
	);
});
