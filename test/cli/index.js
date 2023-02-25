const assert = require('node:assert');
const { exec } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const { basename, resolve, sep } = require('node:path');
const process = require('node:process');
const { copySync, removeSync, statSync } = require('fs-extra');
const {
	normaliseOutput,
	runTestSuiteWithSamples,
	assertDirectoriesAreEqual
} = require('../utils.js');

const cwd = process.cwd();

removeSync(resolve(__dirname, 'node_modules'));
copySync(resolve(__dirname, 'node_modules_rename_me'), resolve(__dirname, 'node_modules'));

runTestSuiteWithSamples(
	'cli',
	resolve(__dirname, 'samples'),
	(directory, config) => {
		(config.skip ? it.skip : config.solo ? it.only : it)(
			basename(directory) + ': ' + config.description,
			() => {
				process.chdir(config.cwd || directory);
				const command = config.command.replace(
					/(^| )rollup($| )/g,
					`node ${resolve(__dirname, '../../dist/bin')}${sep}rollup `
				);
				return runTest(config, command);
			}
		).timeout(50_000);
	},
	() => process.chdir(cwd)
);

async function runTest(config, command) {
	if (config.before) {
		await config.before();
	}
	return new Promise((resolve, reject) => {
		const childProcess = exec(
			command,
			{
				timeout: 40_000,
				env: { ...process.env, FORCE_COLOR: '0', ...config.env }
			},
			(error, code, stderr) => {
				if (config.after) config.after(error, code, stderr);
				if (error && !error.killed) {
					if (config.error) {
						const shouldContinue = config.error(error);
						if (!shouldContinue) return resolve();
					} else {
						throw error;
					}
				}

				if ('stderr' in config) {
					const shouldContinue = config.stderr(stderr);
					if (!shouldContinue) return resolve();
				} else if (stderr) {
					console.error(stderr);
				}

				let unintendedError;

				if (config.execute) {
					try {
						const function_ = new Function('require', 'module', 'exports', 'assert', code);
						const module = {
							exports: {}
						};
						function_(require, module, module.exports, assert);

						if (config.error) {
							unintendedError = new Error('Expected an error while executing output');
						}

						if (config.exports) {
							config.exports(module.exports);
						}
					} catch (error) {
						if (config.error) {
							config.error(error);
						} else {
							unintendedError = error;
						}
					}

					if (config.show || unintendedError) {
						console.log(code + '\n\n\n');
					}

					if (config.solo) console.groupEnd();

					unintendedError ? reject(unintendedError) : resolve();
				} else if (config.result) {
					try {
						config.result(code);
						resolve();
					} catch (error) {
						reject(error);
					}
				} else if (config.test) {
					try {
						config.test();
						resolve();
					} catch (error) {
						reject(error);
					}
				} else if (existsSync('_expected') && statSync('_expected').isDirectory()) {
					try {
						assertDirectoriesAreEqual('_actual', '_expected');
						resolve();
					} catch (error) {
						reject(error);
					}
				} else {
					const expected = readFileSync('_expected.js', 'utf8');
					try {
						assert.equal(normaliseOutput(code), normaliseOutput(expected));
						resolve();
					} catch (error) {
						reject(error);
					}
				}
			}
		);

		childProcess.stderr.on('data', async data => {
			if (config.abortOnStderr) {
				try {
					if (await config.abortOnStderr(data)) {
						childProcess.kill('SIGTERM');
					}
				} catch (error) {
					childProcess.kill('SIGTERM');
					reject(error);
				}
			}
		});
	});
}
