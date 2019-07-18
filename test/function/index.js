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

function runCodeSplitTest(codeMap, entryId, configContext) {
	const requireFromOutputVia = importer => importee => {
		const outputId = path.posix.join(path.posix.dirname(importer), importee);
		const code = codeMap[outputId];
		if (typeof code !== 'undefined') {
			return requireWithContext(
				code,
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
			codeMap[entryId],
			Object.assign({ require: requireFromOutputVia(entryId) }, context)
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
			if (config.show) console.group(path.basename(dir));
			if (config.before) config.before();

			process.chdir(dir);
			const warnings = [];

			return rollup
				.rollup(
					extend(
						{
							input: dir + '/main.js',
							onwarn: warning => warnings.push(warning),
							strictDeprecations: true
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
						.then(({ output }) => {
							if (config.generateError) {
								unintendedError = new Error('Expected an error while generating output');
							}

							result = output;
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
								for (const chunk of result) {
									if (chunk.code) {
										chunk.code = buble.transform(chunk.code, {
											transforms: { modules: false }
										}).code;
									}
								}
							}

							const codeMap = result.reduce((codeMap, chunk) => {
								codeMap[chunk.fileName] = chunk.code;
								return codeMap;
							}, {});
							if (config.code) {
								config.code(result.length === 1 ? result[0].code : codeMap);
							}

							const entryId = result.length === 1 ? result[0].fileName : 'main.js';
							if (!codeMap.hasOwnProperty(entryId)) {
								throw new Error(`Could not find entry "${entryId}" in generated output.`);
							}
							const { exports, error } = runCodeSplitTest(codeMap, entryId, config.context);
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
										for (const chunk of result) {
											console.group(chunk.fileName);
											console.log(chunk.code);
											console.groupEnd();
											console.log();
										}
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

									if (config.show) console.groupEnd();

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
