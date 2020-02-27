import { realpathSync } from 'fs';
import * as path from 'path';
import relative from 'require-relative';
import { InputOptions, WarningHandler } from '../../src/rollup/types';
import mergeOptions, { GenericConfigObject } from '../../src/utils/mergeOptions';
import { getAliasName } from '../../src/utils/relativeId';
import { handleError } from '../logging';
import batchWarnings from './batchWarnings';
import build from './build';
import loadConfigFile from './loadConfigFile';
import { stdinName, stdinPlugin } from './stdin';
import watch from './watch';

export default function runRollup(command: any) {
	let inputSource;
	if (command._.length > 0) {
		if (command.input) {
			handleError({
				code: 'DUPLICATE_IMPORT_OPTIONS',
				message: 'use --input, or pass input path as argument'
			});
		}
		inputSource = command._;
	} else if (typeof command.input === 'string') {
		inputSource = [command.input];
	} else {
		inputSource = command.input;
	}

	if (inputSource && inputSource.length > 0) {
		if (inputSource.some((input: string) => input.indexOf('=') !== -1)) {
			command.input = {};
			inputSource.forEach((input: string) => {
				const equalsIndex = input.indexOf('=');
				const value = input.substr(equalsIndex + 1);
				let key = input.substr(0, equalsIndex);
				if (!key) key = getAliasName(input);
				command.input[key] = value;
			});
		} else {
			command.input = inputSource;
		}
	}

	if (command.environment) {
		const environment = Array.isArray(command.environment)
			? command.environment
			: [command.environment];

		environment.forEach((arg: string) => {
			arg.split(',').forEach((pair: string) => {
				const [key, ...value] = pair.split(':');
				if (value.length) {
					process.env[key] = value.join(':');
				} else {
					process.env[key] = String(true);
				}
			});
		});
	}

	let configFile = command.config === true ? 'rollup.config.js' : command.config;

	if (configFile) {
		if (configFile.slice(0, 5) === 'node:') {
			const pkgName = configFile.slice(5);
			try {
				configFile = relative.resolve(`rollup-config-${pkgName}`, process.cwd());
			} catch (err) {
				try {
					configFile = relative.resolve(pkgName, process.cwd());
				} catch (err) {
					if (err.code === 'MODULE_NOT_FOUND') {
						handleError({
							code: 'MISSING_EXTERNAL_CONFIG',
							message: `Could not resolve config file ${configFile}`
						});
					}

					throw err;
				}
			}
		} else {
			// find real path of config so it matches what Node provides to callbacks in require.extensions
			configFile = realpathSync(configFile);
		}

		if (command.watch) process.env.ROLLUP_WATCH = 'true';

		return loadConfigFile(configFile, command)
			.then(configs => execute(configFile, configs, command))
			.catch(handleError);
	} else {
		if (!command.input && (command.stdin || !process.stdin.isTTY)) {
			command.input = stdinName;
		}
		return execute(configFile, [{ input: [] }], command);
	}
}

async function execute(
	configFile: string,
	configs: GenericConfigObject[],
	command: any
): Promise<void> {
	if (command.watch) {
		watch(configFile, configs, command, command.silent);
	} else {
		for (const config of configs) {
			const warnings = batchWarnings();
			try {
				const { inputOptions, outputOptions, optionError } = mergeOptions({
					command,
					config,
					defaultOnWarnHandler: warnings.add
				});
				if (optionError) {
					(inputOptions.onwarn as WarningHandler)({ code: 'UNKNOWN_OPTION', message: optionError });
				}
				if (command.stdin !== false) {
					inputOptions.plugins!.push(stdinPlugin());
				}
				if (command.plugin) {
					const plugins = Array.isArray(command.plugin) ? command.plugin : [command.plugin];
					for (const plugin of plugins) {
						if (/[={}]/.test(plugin)) {
							// -p plugin=value
							// -p "{transform(c,i){...}}"
							loadAndRegisterPlugin(inputOptions, plugin);
						} else {
							// split out plugins joined by commas
							// -p node-resolve,commonjs,buble
							plugin
								.split(',')
								.forEach((plugin: string) => loadAndRegisterPlugin(inputOptions, plugin));
						}
					}
				}
				await build(inputOptions, outputOptions, warnings, command.silent);
			} catch (err) {
				warnings.flush();
				handleError(err);
			}
		}
	}
}

function loadAndRegisterPlugin(inputOptions: InputOptions, pluginText: string) {
	let plugin: any = null;
	let pluginArg: any = undefined;
	if (pluginText[0] === '{') {
		// -p "{transform(c,i){...}}"
		plugin = new Function('return ' + pluginText);
	} else {
		const match = pluginText.match(/^([@.\/\\\w|^{}|-]+)(=(.*))?$/);
		if (match) {
			// -p plugin
			// -p plugin=arg
			pluginText = match[1];
			pluginArg = new Function('return ' + match[3])();
		} else {
			throw new Error(`Invalid --plugin argument format: ${JSON.stringify(pluginText)}`);
		}
		if (!/^\.|^rollup-plugin-|[@\/\\]/.test(pluginText)) {
			// Try using plugin prefix variations first if applicable.
			// Prefix order is significant - left has higher precedence.
			for (const prefix of ['@rollup/plugin-', 'rollup-plugin-']) {
				try {
					plugin = require(prefix + pluginText);
					break;
				} catch (ex) {
					// if this does not work, we try requiring the actual name below
				}
			}
		}
		if (!plugin) {
			try {
				if (pluginText[0] == '.') pluginText = path.resolve(pluginText);
				plugin = require(pluginText);
			} catch (ex) {
				throw new Error(`Cannot load plugin "${pluginText}"`);
			}
		}
	}
	if (typeof plugin === 'object' && pluginText in plugin) {
		// some plugins do not use `export default` for their entry point.
		// attempt to use the plugin name as the named import name.
		plugin = plugin[pluginText];
	}
	inputOptions.plugins!.push(
		typeof plugin === 'function' ? plugin.call(plugin, pluginArg) : plugin
	);
}
