import { promises as fs } from 'fs';
import { resolve } from 'path';

export async function findConfigFileName(targetDir) {
	const filesInWorkingDir = new Set(await fs.readdir(targetDir));
	for (const extension of ['mjs', 'cjs', 'ts', 'js']) {
		const fileName = `rollup.config.${extension}`;
		if (filesInWorkingDir.has(fileName)) return resolve(targetDir, fileName);
	}
	throw new Error('The repository needs to have a file "rollup.config.js" at the top level.');
}
