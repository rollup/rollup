const path = require('path');
const rollup = require('../../dist/rollup');
const { compareWarnings, runTestSuiteWithSamples } = require('../utils.js');

const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];

runTestSuiteWithSamples('sourcemaps', path.resolve(__dirname, 'samples'), (dir, config) => {
	(config.skip ? describe.skip : config.solo ? describe.only : describe)(
		path.basename(dir) + ': ' + config.description,
		() => {
			for (const format of config.formats || FORMATS) {
				it('generates ' + format, async () => {
					process.chdir(dir);
					const warnings = [];
					const inputOptions = {
						input: dir + '/main.js',
						onwarn: warning => warnings.push(warning),
						strictDeprecations: true,
						...(config.options || {})
					};
					const outputOptions = {
						exports: 'auto',
						file: dir + '/_actual/bundle.' + format + '.js',
						format,
						sourcemap: true,
						...((config.options || {}).output || {})
					};

					let bundle = await rollup.rollup(inputOptions);
					await generateAndTestBundle(bundle, outputOptions, config, format, warnings);
					// cache rebuild does not reemit warnings.
					if (config.warnings) {
						return;
					}
					// test cache noop rebuild
					bundle = await rollup.rollup({ cache: bundle, ...inputOptions });
					await generateAndTestBundle(bundle, outputOptions, config, format, warnings);
				});
			}
		}
	);
});

async function generateAndTestBundle(bundle, outputOptions, config, format, warnings) {
	await bundle.write(outputOptions);
	if (config.warnings) {
		compareWarnings(warnings, config.warnings);
	} else if (warnings.length) {
		throw new Error(`Unexpected warnings`);
	}
	if (config.test) {
		const {
			output: [{ code, map, fileName }]
		} = await bundle.generate(outputOptions);
		await config.test(code, map, { fileName, format });
	}
}
