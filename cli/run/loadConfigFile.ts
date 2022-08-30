import { promises as fs } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import * as rollup from '../../src/node-entry';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { bold } from '../../src/utils/colors';
import {
	errCannotBundleConfigAsEsm,
	errCannotLoadConfigAsCjs,
	errCannotLoadConfigAsEsm,
	errMissingConfig,
	error
} from '../../src/utils/error';
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
	const configs = await getConfigList(
		getDefaultFromCjs(await getConfigFileExport(fileName, commandOptions)),
		commandOptions
	);
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

async function getConfigFileExport(fileName: string, commandOptions: Record<string, unknown>) {
	if (commandOptions.configPlugin || commandOptions.bundleConfigAsCjs) {
		try {
			return await loadTranspiledConfigFile(fileName, commandOptions);
		} catch (err: any) {
			if (err.message.includes('not defined in ES module scope')) {
				return error(errCannotBundleConfigAsEsm(err));
			}
			throw err;
		}
	}
	let cannotLoadEsm = false;
	const handleWarning = (warning: Error): void => {
		if (warning.message.includes('To load an ES module')) {
			cannotLoadEsm = true;
		}
	};
	process.on('warning', handleWarning);
	try {
		const fileUrl = pathToFileURL(fileName);
		if (process.env.ROLLUP_WATCH) {
			// We are adding the current date to allow reloads in watch mode
			fileUrl.search = `?${Date.now()}`;
		}
		return (await import(fileUrl.href)).default;
	} catch (err: any) {
		if (cannotLoadEsm) {
			return error(errCannotLoadConfigAsCjs(err));
		}
		if (err.message.includes('not defined in ES module scope')) {
			return error(errCannotLoadConfigAsEsm(err));
		}
		throw err;
	} finally {
		process.off('warning', handleWarning);
	}
}

function getDefaultFromCjs(namespace: GenericConfigObject): unknown {
	return namespace.default || namespace;
}

async function loadTranspiledConfigFile(
	fileName: string,
	{ bundleConfigAsCjs, configPlugin, silent }: Record<string, unknown>
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
	await addPluginsFromCommandOption(configPlugin, inputOptions);
	const bundle = await rollup.rollup(inputOptions);
	if (!silent && warnings.count > 0) {
		stderr(bold(`loaded ${relativeId(fileName)} with warnings`));
		warnings.flush();
	}
	const {
		output: [{ code }]
	} = await bundle.generate({
		exports: 'named',
		format: bundleConfigAsCjs ? 'cjs' : 'es',
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
	return loadConfigFromWrittenFile(
		join(dirname(fileName), `rollup.config-${Date.now()}.${bundleConfigAsCjs ? 'cjs' : 'mjs'}`),
		code
	);
}

async function loadConfigFromWrittenFile(
	bundledFileName: string,
	bundledCode: string
): Promise<unknown> {
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
