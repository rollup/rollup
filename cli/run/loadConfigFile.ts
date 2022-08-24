import { promises as fs } from 'node:fs';
import { dirname, extname, isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import getPackageType from 'get-package-type';
import * as rollup from '../../src/node-entry';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { bold } from '../../src/utils/colors';
import { errMissingConfig, error } from '../../src/utils/error';
import { mergeOptions } from '../../src/utils/options/mergeOptions';
import type { GenericConfigObject } from '../../src/utils/options/options';
import relativeId from '../../src/utils/relativeId';
import { stderr } from '../logging';
import batchWarnings, { type BatchWarnings } from './batchWarnings';
import { addCommandPluginsToInputOptions, addPluginsFromCommandOption } from './commandPlugins';

export async function loadConfigFile(
	fileName: string,
	commandOptions: any = {}
): Promise<{ options: MergedRollupOptions[]; warnings: BatchWarnings }> {
	const configs = await loadConfigsFromFile(fileName, commandOptions);
	const warnings = batchWarnings();
	try {
		const normalizedConfigs: MergedRollupOptions[] = [];
		for (const config of configs) {
			const options = mergeOptions(config, commandOptions, warnings.add);
			await addCommandPluginsToInputOptions(options, commandOptions);
			normalizedConfigs.push(options);
		}
		return { options: normalizedConfigs, warnings };
	} catch (err) {
		warnings.flush();
		throw err;
	}
}

async function loadConfigsFromFile(
	fileName: string,
	commandOptions: Record<string, unknown>
): Promise<GenericConfigObject[]> {
	const extension = extname(fileName);

	const configFileExport =
		commandOptions.configPlugin ||
		// We always transpile the .js non-module case because many legacy code bases rely on this
		(extension === '.js' && (await getPackageType(fileName)) !== 'module')
			? await loadTranspiledConfigFile(fileName, commandOptions)
			: (await import(pathToFileURL(fileName).href)).default;

	return getConfigList(getDefaultFromCjs(configFileExport), commandOptions);
}

function getDefaultFromCjs(namespace: GenericConfigObject): unknown {
	return namespace.default || namespace;
}

async function loadTranspiledConfigFile(
	fileName: string,
	commandOptions: Record<string, unknown>
): Promise<unknown> {
	const warnings = batchWarnings();
	const inputOptions = {
		external: (id: string) =>
			(id[0] !== '.' && !isAbsolute(id)) || id.slice(-5, id.length) === '.json',
		input: fileName,
		onwarn: warnings.add,
		plugins: [],
		treeshake: false
	};
	await addPluginsFromCommandOption(commandOptions.configPlugin, inputOptions);
	const bundle = await rollup.rollup(inputOptions);
	if (!commandOptions.silent && warnings.count > 0) {
		stderr(bold(`loaded ${relativeId(fileName)} with warnings`));
		warnings.flush();
	}
	const {
		output: [{ code }]
	} = await bundle.generate({
		exports: 'named',
		format: 'es',
		plugins: [
			{
				name: 'transpile-import-meta',
				resolveImportMeta(property, { moduleId }) {
					if (property === 'url') {
						return `'${pathToFileURL(moduleId).href}'`;
					}
					if (property == null) {
						return `{url:'${pathToFileURL(moduleId).href}'}`;
					}
				}
			}
		]
	});
	return loadConfigFromBundledFile(fileName, code);
}

async function loadConfigFromBundledFile(fileName: string, bundledCode: string): Promise<unknown> {
	const bundledFileName = join(dirname(fileName), `rollup.config-${Date.now()}.mjs`);
	await fs.writeFile(bundledFileName, bundledCode);
	try {
		return (await import(pathToFileURL(bundledFileName).href)).default;
	} finally {
		// Not awaiting here saves some ms while potentially hiding a non-critical error
		fs.unlink(bundledFileName);
	}
}

async function getConfigList(configFileExport: any, commandOptions: any): Promise<any[]> {
	const config = await (typeof configFileExport === 'function'
		? configFileExport(commandOptions)
		: configFileExport);
	if (Object.keys(config).length === 0) {
		return error(errMissingConfig());
	}
	return Array.isArray(config) ? config : [config];
}
