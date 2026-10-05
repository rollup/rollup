import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chdir, exit } from 'node:process';
import { fileURLToPath } from 'node:url';

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const nativeArtifactFiles = (await readdir('.')).filter(
	file => file.startsWith('rollup.') && file.endsWith('.node')
);

if (nativeArtifactFiles.length === 0) {
	console.error('No native artifacts found. Run "npm run build:napi" first.');
	exit(1);
}

const outputDirectory = 'dist';
await mkdir(outputDirectory, { recursive: true });
await Promise.all(nativeArtifactFiles.map(file => copyFile(file, join(outputDirectory, file))));
