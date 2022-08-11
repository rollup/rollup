import { extname, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import getPackageType from 'get-package-type';
import * as rollup from '../../src/node-entry';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { bold } from '../../src/utils/colors';
import { errMissingConfig, error, errTranspiledEsmConfig } from '../../src/utils/error';
import { mergeOptions } from '../../src/utils/options/mergeOptions';
import type { GenericConfigObject } from '../../src/utils/options/options';
import relativeId from '../../src/utils/relativeId';
import { stderr } from '../logging';
import batchWarnings, { type BatchWarnings } from './batchWarnings';
import { addCommandPluginsToInputOptions, addPluginsFromCommandOption } from './commandPlugins';

interface NodeModuleWithCompile extends NodeModule {
	_compile(code: string, filename: string): any;
}

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
		(extension === '.js' && getPackageType.sync(fileName) !== 'module')
			? await getDefaultFromTranspiledConfigFile(fileName, commandOptions)
			: getDefaultFromCjs((await import(pathToFileURL(fileName).href)).default);

	return getConfigList(configFileExport, commandOptions);
}

function getDefaultFromCjs(namespace: GenericConfigObject): unknown {
	return namespace.__esModule ? namespace.default : namespace;
}

async function getDefaultFromTranspiledConfigFile(
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
		format: 'cjs',
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

function loadConfigFromBundledFile(fileName: string, bundledCode: string): unknown {
	const resolvedFileName = require.resolve(fileName);
	const extension = extname(resolvedFileName);
	const defaultLoader = require.extensions[extension];
	require.extensions[extension] = (module: NodeModule, requiredFileName: string) => {
		if (requiredFileName === resolvedFileName) {
			(module as NodeModuleWithCompile)._compile(bundledCode, requiredFileName);
		} else {
			if (defaultLoader) {
				defaultLoader(module, requiredFileName);
			}
		}
	};
	delete require.cache[resolvedFileName];
	try {
		const config = getDefaultFromCjs(require(fileName));
		require.extensions[extension] = defaultLoader;
		return config;
	} catch (err: any) {
		if (err.code === 'ERR_REQUIRE_ESM') {
			return error(errTranspiledEsmConfig(fileName));
		}
		throw err;
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
