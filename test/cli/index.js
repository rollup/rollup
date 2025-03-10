const assert = require('node:assert');
const { exec, spawn } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { copySync, removeSync, statSync } = require('fs-extra');
const {
	normaliseOutput,
	runTestSuiteWithSamples,
	assertDirectoriesAreEqual
} = require('../testHelpers.js');

const cwd = process.cwd();
const rollupBinary = `${path.resolve(__dirname, '../../dist/bin')}${path.sep}rollup`;

removeSync(path.resolve(__dirname, 'node_modules'));
copySync(
	path.resolve(__dirname, 'node_modules_rename_me'),
	path.resolve(__dirname, 'node_modules')
);

runTestSuiteWithSamples(
	'cli',
	path.resolve(__dirname, 'samples'),
	/**
	 * @param {import('../types').TestConfigCli} config
	 */
	(directory, config) => {
		(config.skip ? it.skip : config.solo ? it.only : it)(
			path.basename(directory) + ': ' + config.description,
			async () => {
				process.chdir(config.cwd || directory);
				try {
					await runTest(config);
				} catch (error) {
					if (config.retry) {
						console.error('Initial test run failed: ' + error.message + '\nRETRYING...\n');
						return runTest(config);
					}
					throw error;
				}
			}
		).timeout(80_000);
	},
	() => process.chdir(cwd)
);

async function runTest(config) {
	if (config.before) {
		await config.before();
	}
	return new Promise((resolve, reject) => {
		let stdout = '';
		let stderr = '';

		const spawnOptions = {
			timeout: 40_000,
			env: { ...process.env, FORCE_COLOR: '0', ...config.env },
			killSignal: 'SIGKILL'
		};
		const childProcess = config.spawnArgs
			? spawn('node', [rollupBinary, ...config.spawnArgs], spawnOptions)
			: exec(config.command.replace(/(^| )rollup($| )/g, ` node ${rollupBinary} `), spawnOptions);

		childProcess.stdout.on('data', data => {
			stdout += data;
		});

		childProcess.stderr.on('data', async data => {
			stderr += data;
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

		childProcess.on('error', error => {
			console.log('GOT AN ERROR', error);
			reject(error);
			childProcess.kill('SIGKILL');
		});

		childProcess.on('close', async code => {
			try {
				let error;
				if (code > 0) {
					error = new Error(stderr);
					error.code = code;
				}
				if (config.after) {
					await config.after(error, stdout, stderr);
				}
				if (error && !childProcess.killed) {
					if (config.error) {
						if (!config.error(error)) {
							return resolve();
						}
					} else {
						return reject(error);
					}
				}
				if (childProcess.signalCode === 'SIGKILL') {
					return reject(new Error('Test aborted due to timeout.'));
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
						const function_ = new Function('require', 'module', 'exports', 'assert', stdout);
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
						console.log(stdout + '\n\n\n');
					}

					if (config.solo) console.groupEnd();

					return unintendedError ? reject(unintendedError) : resolve();
				}
				if (config.result) {
					config.result(stdout);
					return resolve();
				}
				if (config.test) {
					config.test();
					return resolve();
				}
				if (existsSync('_expected') && statSync('_expected').isDirectory()) {
					assertDirectoriesAreEqual('_actual', '_expected');
					return resolve();
				}
				const expected = readFileSync('_expected.js', 'utf8');
				assert.equal(normaliseOutput(stdout), normaliseOutput(expected));
				return resolve();
			} catch (error) {
				return reject(error);
			}
		});
	});
}
