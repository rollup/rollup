const path = require('path');
const rollup = require('../../dist/rollup');
const { compareWarnings, extend, runTestSuiteWithSamples } = require('../utils.js');

const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];

runTestSuiteWithSamples('sourcemaps', path.resolve(__dirname, 'samples'), (dir, config) => {
	(config.skip ? describe.skip : config.solo ? describe.only : describe)(
		path.basename(dir) + ': ' + config.description,
		() => {
			(config.formats || FORMATS).forEach(format =>
				it('generates ' + format, () => {
					process.chdir(dir);
					const warnings = [];
					const inputOptions = extend(
						{
							input: dir + '/main.js',
							onwarn: warning => warnings.push(warning),
							strictDeprecations: true
						},
						config.options || {}
					);
					const outputOptions = extend(
						{
							file: dir + '/_actual/bundle.' + format + '.js',
							format,
							sourcemap: true
						},
						(config.options || {}).output || {}
					);

					return rollup.rollup(inputOptions).then(bundle =>
						generateAndTestBundle(bundle, outputOptions, config, format, warnings).then(() => {
							// cache rebuild does not reemit warnings.
							if (config.warnings) {
								return;
							}
							// test cache noop rebuild
							return rollup
								.rollup(extend({ cache: bundle }, inputOptions))
								.then(bundle =>
									generateAndTestBundle(bundle, outputOptions, config, format, warnings)
								);
						})
					);
				})
			);
		}
	);
});

function generateAndTestBundle(bundle, outputOptions, config, format, warnings) {
	return bundle
		.write(outputOptions)
		.then(() => {
			if (config.warnings) {
				compareWarnings(warnings, config.warnings);
			} else if (warnings.length) {
				throw new Error(`Unexpected warnings`);
			}
			return bundle.generate(outputOptions);
		})
		.then(({ output: [{ code, map }] }) => {
			if (config.test) {
				return config.test(code, map, { format });
			}
		});
}
