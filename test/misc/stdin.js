const assert = require('assert');
const rollup = require('../../dist/rollup');

describe('stdin', () => {
	it('throws when using the "watch" option with stdin "-"', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: '-',
				onwarn: warning => warnings.push(warning),
				watch: true
			})
			.then(bundle => {
				throw new Error('Should not be thrown');
			})
			.catch(err => {
				assert.equal(err.message, 'watch mode is incompatible with stdin input');
			});
	});

	it('stdin reads should fail if process.stdin not present (as in a browser)', () => {
		const warnings = [];
		process.env.ROLLUP_SIMULATE_PROCESS_STDIN_NOT_PRESENT = true;

		return new Promise((resolve, reject) => {
			rollup.rollup({
				input: '-',
				onwarn: warning => warnings.push(warning),
			})
			.then(bundle => {
				delete process.env.ROLLUP_SIMULATE_PROCESS_STDIN_NOT_PRESENT;
				throw new Error('Should not be reached (1)');
			})
			.catch(err => {
				delete process.env.ROLLUP_SIMULATE_PROCESS_STDIN_NOT_PRESENT;
				reject(err);
			});
		}).then(data => {
			delete process.env.ROLLUP_SIMULATE_PROCESS_STDIN_NOT_PRESENT;
			throw new Error('Should not be reached (2)');
		}).catch(err => {
			delete process.env.ROLLUP_SIMULATE_PROCESS_STDIN_NOT_PRESENT;
			assert.equal(err.message, 'Could not load -: stdin input is invalid in browser');
		});
	});

	/*
	This test runs successfully on all Node versions locally, but not on CircleCI.
	I haven't found a way to reliably test creating stdin read errors on NodeJS.

	// This test should probably be last due to induced stdin read error
	it('rollup should fail upon stdin read error', () => {
		// clean up vestige of previous test if it failed
		delete process.env.ROLLUP_SIMULATE_PROCESS_STDIN_NOT_PRESENT;

		setTimeout(() => {
			process.stdin.emit('error', new Error('Simulated error reading stdin'));
			setTimeout(() => {
				process.stdin.emit('end');
			}, 100);
		}, 1000);

		const warnings = [];

		return new Promise((resolve, reject) => {
			rollup.rollup({
				input: '-',
				onwarn: warning => warnings.push(warning),
			})
			.then(bundle => {
				bundle.generate({});
			})
			.then(() => {
				throw new Error('Should not be reached (1)');
			})
			.catch(err => {
				reject(err);
			});
		})
		.then(() => {
			throw new Error('Should not be reached (2)');
		})
		.catch(err => {
			assert.equal(err.message, 'Could not load -: Simulated error reading stdin');
		});
	});
	*/
});
