const path = require('path');
const assert = require('assert');
const sander = require('sander');
const rollup = require('../../dist/rollup');
const { extend, loadConfig, normaliseOutput } = require('../utils.js');

const samples = path.resolve(__dirname, 'samples');

const FORMATS = ['amd', 'cjs', 'es', 'iife', 'umd'];

describe('form', () => {
	sander.readdirSync(samples).sort().forEach(dir => {
		if (dir[0] === '.') return; // .DS_Store...

		const config = loadConfig(samples + '/' + dir + '/_config.js');

		if (config.skipIfWindows && process.platform === 'win32') return;
		if (!config.options) {
			config.options = {};
		}
		if (!('indent' in config.options)) {
			config.options.indent = true;
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

		(config.skip ? describe.skip : config.solo ? describe.only : describe)(dir, () => {
			let promise;
			const createBundle = () => promise || (promise = rollup.rollup(options));

			FORMATS.forEach(format => {
				it('generates ' + format, () => {
					process.chdir(samples + '/' + dir);

					return createBundle().then(bundle => {
						const options = extend({}, config.options, {
							file: samples + '/' + dir + '/_actual/' + format + '.js',
							format
						});

						return bundle.write(options).then(() => {
							const actualCode = normaliseOutput(
								sander.readFileSync(samples, dir, '_actual', format + '.js')
							);
							let expectedCode;
							let actualMap;
							let expectedMap;

							try {
								expectedCode = normaliseOutput(
									sander.readFileSync(samples, dir, '_expected', format + '.js')
								);
							} catch (err) {
								expectedCode = 'missing file';
							}

							try {
								actualMap = JSON.parse(
									sander
										.readFileSync(samples, dir, '_actual', format + '.js.map')
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
										.readFileSync(samples, dir, '_expected', format + '.js.map')
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
		});
	});
});
