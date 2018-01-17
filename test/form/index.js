const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const sander = require('sander');
const fixturify = require('fixturify');
const rollup = require('../../dist/rollup');
const { extend, loadConfig, normaliseOutput } = require('../utils.js');

const samples = path.resolve(__dirname, 'samples');

const FORMATS = ['amd', 'cjs', 'es', 'iife', 'umd'];

describe('form', () => {
	sander.readdirSync(samples).sort().forEach(dir => {
		if (dir[0] === '.') return; // .DS_Store...

		const fixtures = path.join(samples, dir);

		const config = loadConfig(fixtures + '/_config.js');

		if (config.skipIfWindows && process.platform === 'win32') return;
		if (!config.options) {
			config.options = {};
		}

		const options = extend(
			{},
			{
				input: samples + '/' + dir + '/main.js',
				onwarn: msg => {
					if (/No name was provided for/.test(msg)) return;
					if (/as external dependency/.test(msg)) return;
					console.error(msg);
				}
			},
			config.options
		);

		describe(dir, () => {
			let promise;
			const createBundle = () => promise || (promise = rollup.rollup(options));

			const expectedDir = path.join(fixtures, '_expected');
			const actualDir = path.join(fixtures, '_actual');

			FORMATS.forEach(format => {
				(config.skip ? it.skip : config.solo ? it.only : it)('generates ' + format, () => {
					process.chdir(samples + '/' + dir);

					return createBundle().then(bundle => {
						const options = extend({}, config.options, {
							file: actualDir + '/' + format + '.js',
							format,
							indent: !('indent' in config.options) ? true : config.options.indent,
						});

						return bundle.write(options).then(() => {
							const actualCode = normaliseOutput(
								sander.readFileSync(actualDir, format + '.js')
							);
							let expectedCode;
							let actualMap;
							let expectedMap;

							try {
								expectedCode = normaliseOutput(
									sander.readFileSync(expectedDir, format + '.js')
								);
							} catch (err) {
								expectedCode = 'missing file';
							}

							try {
								actualMap = JSON.parse(
									sander
										.readFileSync(actualDir, format + '.js.map')
										.toString()
								);
								actualMap.sourcesContent = actualMap.sourcesContent.map(
									normaliseOutput
								);
							} catch (err) {
								assert.equal(err.code, 'ENOENT');
							}

							try {
								expectedMap = JSON.parse(
									sander
										.readFileSync(expectedDir, format + '.js.map')
										.toString()
								);
								expectedMap.sourcesContent = expectedMap.sourcesContent.map(
									normaliseOutput
								);
							} catch (err) {
								assert.equal(err.code, 'ENOENT');
							}

							if (config.show) {
								console.log(actualCode + '\n\n\n');
							}

							assert.equal(actualCode, expectedCode);
							assert.deepEqual(actualMap, expectedMap);
						});
					});
				});
			});

			const expectedModulesDir = path.join(fixtures, '_expected', 'modules');
			const actualModulesDir = path.join(fixtures, '_actual', 'modules');
			if (!fs.existsSync(expectedModulesDir) && !config.emptyModules) {
				return;
			}

			// clear out folder from a possibly bad previous test
			fs.removeSync(actualModulesDir);

			const moduleOptions = extend(
				{},
				{
					includeAllNamespacedInternal: true
				},
				options
			);

			(config.skipModules ? it.skip : config.soloModules ? it.only : it)('generates modules', () => {
				process.chdir(fixtures);

				return rollup.rollup(moduleOptions).then(bundle => {
					const options = extend({}, config.options, {
						srcDir: fixtures,
						destDir: actualModulesDir,
						preserveModules: true
					});

					return bundle.write(options);
				}).then(() => {
					fs.ensureDirSync(actualModulesDir);
					fs.ensureDirSync(expectedModulesDir);

					assert.deepEqual(
						fixturify.readSync(actualModulesDir),
						fixturify.readSync(expectedModulesDir)
					);
				});
			});
		});
	});
});
