import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { chdir, exit } from 'node:process';
import { fileURLToPath } from 'node:url';

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const outputDirectory = process.argv[2];

if (!outputDirectory) {
	console.error('Usage: tsx scripts/clean-wasm-output.ts <wasm-output-directory>');
	exit(1);
}

await rm(join(outputDirectory, '.gitignore'), { force: true });
