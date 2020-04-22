import color from 'colorette';
import * as path from 'path';
import { pathToFileURL } from 'url';
import * as rollup from '../../src/node-entry';
import { MergedRollupOptions } from '../../src/rollup/types';
import { error } from '../../src/utils/error';
import { mergeOptions } from '../../src/utils/mergeOptions';
import { GenericConfigObject } from '../../src/utils/parseOptions';
import relativeId from '../../src/utils/relativeId';
import { stderr } from '../logging';
import batchWarnings, { BatchWarnings } from './batchWarnings';
import { addCommandPluginsToInputOptions } from './commandPlugins';

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
		const normalizedConfigs = configs.map((config) => {
			const options = mergeOptions(config, commandOptions, warnings.add);
			addCommandPluginsToInputOptions(options, commandOptions);
			return options;
		});
		return { options: normalizedConfigs, warnings };
	} catch (err) {
		warnings.flush();
		throw err;
	}
}

async function loadConfigFile(
	fileName: string,
	commandOptions: any
): Promise<GenericConfigObject[]> {
	const extension = path.extname(fileName);
	const configFileExport =
		extension === '.mjs' && supportsNativeESM()
			? (await import(pathToFileURL(fileName).href)).default
			: extension === '.cjs'
			? getDefaultFromCjs(require(fileName))
			: await getDefaultFromTranspiledConfigFile(fileName, commandOptions.silent);
	return getConfigList(configFileExport, commandOptions);
}

function getDefaultFromCjs(namespace: GenericConfigObject) {
	return namespace.__esModule ? namespace.default : namespace;
}

async function getDefaultFromTranspiledConfigFile(
	fileName: string,
	silent: boolean
): Promise<unknown> {
	const warnings = batchWarnings();
	const bundle = await rollup.rollup({
		external: (id: string) =>
			(id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json',
		input: fileName,
		onwarn: warnings.add,
		treeshake: false,
	});
	if (!silent && warnings.count > 0) {
		stderr(color.bold(`loaded ${relativeId(fileName)} with warnings`));
		warnings.flush();
	}
	const {
		output: [{ code }],
	} = await bundle.generate({
		exports: 'named',
		format: 'cjs',
	});
	return loadConfigFromBundledFile(fileName, code);
}

async function loadConfigFromBundledFile(fileName: string, bundledCode: string) {
	const extension = path.extname(fileName);
	const defaultLoader = require.extensions[extension]!;
	require.extensions[extension] = (module: NodeModule, filename: string) => {
		if (filename === fileName) {
			(module as NodeModuleWithCompile)._compile(bundledCode, filename);
		} else {
			defaultLoader(module, filename);
		}
	};
	delete require.cache[fileName];
	try {
		const config = getDefaultFromCjs(require(fileName));
		require.extensions[extension] = defaultLoader;
		return config;
	} catch (err) {
		if (err.code === 'ERR_REQUIRE_ESM') {
			return error({
				code: 'TRANSPILED_ESM_CONFIG',
				message: `While loading the Rollup configuration from "${relativeId(
					fileName
				)}", Node tried to require an ES module from a CommonJS file, which is not supported. A common cause is if there is a package.json file with "type": "module" in the same folder. You can try to fix this by changing the extension of your configuration file to ".cjs" or ".mjs" depending on the content, which will prevent Rollup from trying to preprocess the file but rather hand it to Node directly.`,
				url: 'https://rollupjs.org/guide/en/#using-untranspiled-config-files',
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
			url: 'https://rollupjs.org/guide/en/#configuration-files',
		});
	}
	return Array.isArray(config) ? config : [config];
}
