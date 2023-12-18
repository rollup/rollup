import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * @param {string} targetDirectory
 * @return {Promise<string>}
 */
export async function findConfigFileName(targetDirectory) {
	const filesInWorkingDirectory = new Set(await readdir(targetDirectory));
	for (const extension of ['mjs', 'cjs', 'ts', 'js']) {
		const fileName = `rollup.config.${extension}`;
		if (filesInWorkingDirectory.has(fileName)) return resolve(targetDirectory, fileName);
	}
	throw new Error('The repository needs to have a file "rollup.config.js" at the top level.');
}
