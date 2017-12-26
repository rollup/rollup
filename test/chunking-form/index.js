const path = require('path');
const assert = require('assert');
const sander = require('sander');
const rollup = require('../../dist/rollup');
const { extend, loadConfig, normaliseOutput } = require('../utils.js');

const samples = path.resolve(__dirname, 'samples');

const FORMATS = ['es', 'cjs', 'amd'];

describe('form', () => {
	sander.readdirSync(samples).sort().forEach(dir => {
		if (dir[0] === '.') return; // .DS_Store...

		const config = loadConfig(samples + '/' + dir + '/_config.js');

		if (config.skipIfWindows && process.platform === 'win32') return;
		if (!config.options) {
			config.options = {};
		}

		const options = extend(
			{},
			{
				input: [samples + '/' + dir + '/main.js'],
				experimentalCodeSplitting: true,
				experimentalDynamicImport: true,
				onwarn: msg => {
					if (/No name was provided for/.test(msg)) return;
					if (/as external dependency/.test(msg)) return;
					console.error(msg);
				}
			},
			config.options
		);

		(config.skip ? describe.skip : config.solo ? describe.only : describe)(dir, () => {
			let promise;
			const createBundle = () => promise || (promise = rollup.rollup(options));

			FORMATS.forEach(format => {
				it('generates ' + format, () => {
					process.chdir(samples + '/' + dir);

					return createBundle().then(bundle => {
						const options = extend({}, config.options, {
							dir: samples + '/' + dir + '/_actual/' + format,
							format,
							indent: !('indent' in config.options) ? true : config.options.indent,
						});

						sander.rimrafSync(options.dir);

						return bundle.write(options).then(() => {
							const actualFiles = sander.readdirSync(samples, dir, '_actual', format);

							let expectedFiles;
							try {
								expectedFiles = sander.readdirSync(samples, dir, '_expected', format);
							} catch (err) {
								expectedFiles = [];
							}

							assert.deepEqual(actualFiles.sort(), expectedFiles.sort(), 'Invalid output files');

							actualFiles.forEach(file => {
								const actualCode = normaliseOutput(
									sander.readFileSync(samples, dir, '_actual', format, file)
								);
								let expectedCode;
								let actualMap;
								let expectedMap;

								try {
									expectedCode = normaliseOutput(
										sander.readFileSync(samples, dir, '_expected', format, file)
									);
								} catch (err) {
									expectedCode = 'missing file';
								}

								/*try {
									actualMap = JSON.parse(
										sander
											.readFileSync(samples, dir, '_actual', format, file + '.js.map')
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
											.readFileSync(samples, dir, '_expected', format, file + '.js.map')
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
								}*/

								assert.equal(actualCode, expectedCode, `Unexpected file source for ${format}/${file}`);
								// assert.deepEqual(actualMap, expectedMap `Unexpected source map for ${format}/${file}`);
							});
						});
					});
				});
			});
		});
	});
});
