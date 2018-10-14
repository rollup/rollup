const path = require('path');
const assert = require('assert');
const buble = require('buble');
const rollup = require('../../dist/rollup');
const { compareError, compareWarnings, extend, runTestSuiteWithSamples } = require('../utils.js');

function requireWithContext(code, context) {
	const module = { exports: {} };
	const contextWithExports = Object.assign({}, context, { module, exports: module.exports });
	const contextKeys = Object.keys(contextWithExports);
	const contextValues = contextKeys.map(key => contextWithExports[key]);
	try {
		const fn = new Function(contextKeys, code);
		fn.apply({}, contextValues);
	} catch (error) {
		error.exports = module.exports;
		throw error;
	}
	return contextWithExports.module.exports;
}

function runSingleFileTest(code, configContext) {
	let exports;
	try {
		exports = requireWithContext(code, Object.assign({ require, assert }, configContext));
	} catch (error) {
		return { error, exports: error.exports };
	}
	return { exports };
}

function runCodeSplitTest(output, configContext) {
	const requireFromOutputVia = importer => importee => {
		const outputId = path.join(path.dirname(importer), importee);
		const chunk = output[outputId];
		if (chunk) {
			return requireWithContext(
				chunk.code,
				Object.assign({ require: requireFromOutputVia(outputId) }, context)
			);
		} else {
			return require(importee);
		}
	};

	const context = Object.assign({ assert }, configContext);
	let exports;
	try {
		exports = requireWithContext(
			output['main.js'].code,
			Object.assign({ require: requireFromOutputVia('main.js') }, context)
		);
	} catch (error) {
		return { error, exports: error.exports };
	}
	return { exports };
}

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
						.then(generated => {
							if (config.generateError) {
								unintendedError = new Error('Expected an error while generating output');
							}
							result = generated;
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

							if (config.buble) {
								if (result.output) {
									for (const chunkId of Object.keys(result.output)) {
										if (result.output[chunkId].code) {
											result.output[chunkId].code = buble.transform(result.output[chunkId].code, {
												transforms: { modules: false }
											}).code;
										}
									}
								} else {
									result.code = buble.transform(result.code, {
										transforms: { modules: false }
									}).code;
								}
							}

							if (config.code) {
								if (result.output) {
									config.code(result.output);
								} else {
									config.code(result.code);
								}
							}

							const { exports, error } = result.output
								? runCodeSplitTest(result.output, config.context)
								: runSingleFileTest(result.code, config.context);

							if (config.runtimeError) {
								if (error) {
									config.runtimeError(error);
								} else {
									unintendedError = new Error('Expected an error while executing output');
								}
							} else if (error) {
								unintendedError = error;
							}
							return Promise.resolve()
								.then(() => {
									if (config.exports && !unintendedError) {
										return config.exports(exports);
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
