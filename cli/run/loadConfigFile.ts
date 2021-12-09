import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import * as rollup from '../../src/node-entry';
import { MergedRollupOptions } from '../../src/rollup/types';
import { bold } from '../../src/utils/colors';
import { error } from '../../src/utils/error';
import { mergeOptions } from '../../src/utils/options/mergeOptions';
import { GenericConfigObject } from '../../src/utils/options/options';
import relativeId from '../../src/utils/relativeId';
import { stderr } from '../logging';
import batchWarnings, { BatchWarnings } from './batchWarnings';
import { addCommandPluginsToInputOptions, addPluginsFromCommandOption } from './commandPlugins';

function supportsNativeESM() {
	return Number(/^v(\d+)/.exec(process.version)![1]) >= 13;
}

interface NodeModuleWithCompile extends NodeModule {
	_compile(code: string, filename: string): any;
}

export default async function loadAndParseConfigFile(
	fileName: string,
	commandOptions: any = {}
): Promise<{ options: MergedRollupOptions[]; warnings: BatchWarnings }> {
	const configs = await loadConfigFile(fileName, commandOptions);
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

async function loadConfigFile(
	fileName: string,
	commandOptions: Record<string, unknown>
): Promise<GenericConfigObject[]> {
	const extension = path.extname(fileName);

	const configFileExport =
		commandOptions.configPlugin ||
		!(extension === '.cjs' || (extension === '.mjs' && supportsNativeESM()))
			? await getDefaultFromTranspiledConfigFile(fileName, commandOptions)
			: extension === '.cjs'
			? getDefaultFromCjs(require(fileName))
			: (await import(pathToFileURL(fileName).href)).default;

	return getConfigList(configFileExport, commandOptions);
}

function getDefaultFromCjs(namespace: GenericConfigObject) {
	return namespace.__esModule ? namespace.default : namespace;
}

async function getDefaultFromTranspiledConfigFile(
	fileName: string,
	commandOptions: Record<string, unknown>
): Promise<unknown> {
	const warnings = batchWarnings();
	const inputOptions = {
		external: (id: string) =>
			(id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json',
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

async function loadConfigFromBundledFile(fileName: string, bundledCode: string) {
	const resolvedFileName = fs.realpathSync(fileName);
	const extension = path.extname(resolvedFileName);
	const defaultLoader = require.extensions[extension];
	require.extensions[extension] = (module: NodeModule, requiredFileName: string) => {
		if (requiredFileName === resolvedFileName) {
			(module as NodeModuleWithCompile)._compile(bundledCode, requiredFileName);
		} else {
			defaultLoader(module, requiredFileName);
		}
	};
	delete require.cache[resolvedFileName];
	try {
		const config = getDefaultFromCjs(require(fileName));
		require.extensions[extension] = defaultLoader;
		return config;
	} catch (err: any) {
		if (err.code === 'ERR_REQUIRE_ESM') {
			return error({
				code: 'TRANSPILED_ESM_CONFIG',
				message: `While loading the Rollup configuration from "${relativeId(
					fileName
				)}", Node tried to require an ES module from a CommonJS file, which is not supported. A common cause is if there is a package.json file with "type": "module" in the same folder. You can try to fix this by changing the extension of your configuration file to ".cjs" or ".mjs" depending on the content, which will prevent Rollup from trying to preprocess the file but rather hand it to Node directly.`,
				url: 'https://rollupjs.org/guide/en/#using-untranspiled-config-files'
			});
		}
		throw err;
	}
}

async function getConfigList(configFileExport: any, commandOptions: any) {
	const config = await (typeof configFileExport === 'function'
		? configFileExport(commandOptions)
		: configFileExport);
	if (Object.keys(config).length === 0) {
		return error({
			code: 'MISSING_CONFIG',
			message: 'Config file must export an options object, or an array of options objects',
			url: 'https://rollupjs.org/guide/en/#configuration-files'
		});
	}
	return Array.isArray(config) ? config : [config];
}
