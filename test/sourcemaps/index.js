const path = require('node:path');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const rollup = require('../../dist/rollup');
const { compareWarnings, runTestSuiteWithSamples } = require('../utils.js');

const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];

runTestSuiteWithSamples(
	'sourcemaps',
	path.resolve(__dirname, 'samples'),
	(directory, configuration) => {
		(configuration.skip ? describe.skip : configuration.solo ? describe.only : describe)(
			path.basename(directory) + ': ' + configuration.description,
			() => {
				for (const format of configuration.formats || FORMATS) {
					it('generates ' + format, async () => {
						process.chdir(directory);
						const warnings = [];
						const inputOptions = {
							input: directory + '/main.js',
							onwarn: warning => warnings.push(warning),
							strictDeprecations: true,
							...configuration.options
						};
						const outputOptions = {
							exports: 'auto',
							file: directory + '/_actual/bundle.' + format + '.js',
							format,
							sourcemap: true,
							...(configuration.options || {}).output
						};

						let bundle = await rollup.rollup(inputOptions);
						await generateAndTestBundle(bundle, outputOptions, configuration, format, warnings);
						// cache rebuild does not reemit warnings.
						if (configuration.warnings) {
							return;
						}
						// test cache noop rebuild
						bundle = await rollup.rollup({ cache: bundle, ...inputOptions });
						await generateAndTestBundle(bundle, outputOptions, configuration, format, warnings);
					});
				}
			}
		);
	}
);

async function generateAndTestBundle(bundle, outputOptions, configuration, format, warnings) {
	await bundle.write(outputOptions);
	if (configuration.warnings) {
		compareWarnings(warnings, configuration.warnings);
	} else if (warnings.length > 0) {
		throw new Error(`Unexpected warnings`);
	}
	if (configuration.test) {
		const {
			output: [{ code, map, fileName }]
		} = await bundle.generate(outputOptions);
		await configuration.test(code, map, { fileName, format });
	}
}
