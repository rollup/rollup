const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '../..');
const distributionDir = path.join(repoRoot, 'dist');
const distributionBuildDir = path.join(repoRoot, 'dist-build');
const distributionNativeDir = path.join(repoRoot, 'dist-native');
const distributionWasmDir = path.join(repoRoot, 'dist-wasm');
const hasWasmDistribution = fs.existsSync(distributionWasmDir);

const run = (command, arguments_) => {
	const result = spawnSync(command, arguments_, {
		cwd: repoRoot,
		encoding: 'utf8',
		shell: process.platform === 'win32' && command === 'npm'
	});
	assert.strictEqual(
		result.status,
		0,
		`"${command} ${arguments_.join(' ')}" failed with exit code ${result.status}:\n${result.stderr}${result.stdout}`
	);
	return result;
};

const runRollupCli = (cliDir, arguments_) =>
	run(process.execPath, [path.join(cliDir, 'bin/rollup'), ...arguments_]);

const restoreDistribution = () => {
	// restore the original dist if a step crashed midway
	const backupDir = fs.existsSync(distributionBuildDir)
		? distributionBuildDir
		: fs.existsSync(distributionNativeDir)
			? distributionNativeDir
			: null;
	if (backupDir) {
		fs.rmSync(distributionDir, { recursive: true, force: true });
		fs.renameSync(backupDir, distributionDir);
	}
};

describe('smoke test', function () {
	this.timeout(0);
	const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rollup-smoke-'));

	after(() => {
		fs.rmSync(fixtureDir, { recursive: true, force: true });
		restoreDistribution();
	});

	it('prints the version from the downloaded dist', () => {
		assert.match(runRollupCli(distributionDir, ['--version']).stdout, /rollup v\d+\.\d+\.\d+/);
	});

	it('bundles rollup with the rollup in the downloaded dist', () => {
		// the bootstrap script restores the previous build if the build fails
		run('npm', ['run', 'build:bootstrap:cjs']);
	});

	it('prints the version from the freshly built dist', () => {
		assert.match(runRollupCli(distributionDir, ['--version']).stdout, /rollup v\d+\.\d+\.\d+/);
	});

	it('passes the parse-and-walk suite against the native dist', () => {
		run('npm', ['run', 'test:ast']);
	});

	(hasWasmDistribution ? describe : describe.skip)('wasm dist', function () {
		this.timeout(0);

		it('prints the version from the wasm dist', () => {
			assert.match(
				runRollupCli(distributionWasmDir, ['--version']).stdout,
				/rollup v\d+\.\d+\.\d+/
			);
		});

		it('produces identical output from the native and the wasm dist', () => {
			const fixture = path.join(fixtureDir, 'smoke.js');
			fs.writeFileSync(
				fixture,
				'export const value = -1.5 + 1e-310;\nexport const text = `héllo ${value}`;\n'
			);
			const nativeOutput = runRollupCli(distributionDir, [
				fixture,
				'--format',
				'es',
				'--silent'
			]).stdout;
			const wasmOutput = runRollupCli(distributionWasmDir, [
				fixture,
				'--format',
				'es',
				'--silent'
			]).stdout;
			assert.strictEqual(wasmOutput, nativeOutput);
		});

		it('passes the parse-and-walk suite against the wasm dist', () => {
			fs.renameSync(distributionDir, distributionNativeDir);
			fs.cpSync(distributionWasmDir, distributionDir, { recursive: true });
			try {
				run('npm', ['run', 'test:ast']);
			} finally {
				fs.rmSync(distributionDir, { recursive: true, force: true });
				fs.renameSync(distributionNativeDir, distributionDir);
			}
		});
	});
});
