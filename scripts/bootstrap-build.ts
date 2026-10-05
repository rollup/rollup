import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, readdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { chdir, exit } from 'node:process';
import { fileURLToPath } from 'node:url';

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const outputDirectory = 'dist';
const previousBuildDirectory = 'dist-build';

if (!existsSync(outputDirectory)) {
	console.error('No "dist" directory found. Run a build first.');
	exit(1);
}

await rm(previousBuildDirectory, { force: true, recursive: true });
await rename(outputDirectory, previousBuildDirectory);
// Ensure Ctrl+C does not kill this script before the previous build is restored
process.on('SIGINT', () => {});
const bootstrapProcess = spawn(
	process.execPath,
	[
		'dist-build/bin/rollup',
		'--config',
		'rollup.config.ts',
		'--configPlugin',
		'typescript',
		...process.argv.slice(2),
		'--forceExit'
	],
	{ stdio: 'inherit' }
);
const exitCode = await new Promise<number | null>(resolve => bootstrapProcess.on('exit', resolve));

if (exitCode !== 0) {
	await rm(outputDirectory, { force: true, recursive: true });
	await rename(previousBuildDirectory, outputDirectory);
	console.error('Bootstrap build failed, previous build restored.');
	exit(exitCode ?? 1);
}

const nativeArtifactFiles = (await readdir(previousBuildDirectory)).filter(
	file => file.startsWith('rollup.') && file.endsWith('.node')
);
await Promise.all(
	nativeArtifactFiles.map(file =>
		copyFile(join(previousBuildDirectory, file), join(outputDirectory, file))
	)
);

await rm(previousBuildDirectory, { force: true, recursive: true });
