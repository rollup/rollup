import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

export async function findConfigFileName(targetDirectory) {
	const filesInWorkingDirectory = new Set(await fs.readdir(targetDirectory));
	for (const extension of ['mjs', 'cjs', 'ts', 'js']) {
		const fileName = `rollup.config.${extension}`;
		if (filesInWorkingDirectory.has(fileName)) return resolve(targetDirectory, fileName);
	}
	throw new Error('The repository needs to have a file "rollup.config.js" at the top level.');
}
