import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { cwd } from 'node:process';
import { logMissingExternalConfig } from '../../src/utils/logs';
import { handleError } from '../logging';

const DEFAULT_CONFIG_BASE = 'rollup.config';

export async function getConfigPath(commandConfig: string | true): Promise<string> {
	if (commandConfig === true) {
		return path.resolve(await findConfigFileNameInCwd());
	}
	if (commandConfig.slice(0, 5) === 'node:') {
		const packageName = commandConfig.slice(5);
		try {
			// eslint-disable-next-line unicorn/prefer-module
			return require.resolve(`rollup-config-${packageName}`, { paths: [cwd()] });
		} catch {
			try {
				// eslint-disable-next-line unicorn/prefer-module
				return require.resolve(packageName, { paths: [cwd()] });
			} catch (error: any) {
				if (error.code === 'MODULE_NOT_FOUND') {
					handleError(logMissingExternalConfig(commandConfig));
				}
				throw error;
			}
		}
	}
	return path.resolve(commandConfig);
}

async function findConfigFileNameInCwd(): Promise<string> {
	const filesInWorkingDirectory = new Set(await readdir(cwd()));
	for (const extension of ['mjs', 'cjs', 'ts']) {
		const fileName = `${DEFAULT_CONFIG_BASE}.${extension}`;
		if (filesInWorkingDirectory.has(fileName)) return fileName;
	}
	return `${DEFAULT_CONFIG_BASE}.js`;
}
