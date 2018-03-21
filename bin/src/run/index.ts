import { realpathSync } from 'fs';
import relative from 'require-relative';
import { handleError } from '../logging';
import mergeOptions from '../../../src/utils/mergeOptions';
import batchWarnings from './batchWarnings';
import loadConfigFile from './loadConfigFile';
import sequence from '../utils/sequence';
import build from './build';
import watch from './watch';
import { InputOptions } from '../../../src/rollup/index';
import { basename } from '../../../src/utils/path';

export default function runRollup(command: any) {
	if (command._.length >= 1) {
		if (command.input) {
			handleError({
				code: 'DUPLICATE_IMPORT_OPTIONS',
				message: 'use --input, or pass input path as argument'
			});
		}
	}

	if (command.dir) {
		if (!command._.some((input: string) => input.indexOf('=') !== -1)) {
			command.input = command._;
		} else {
			command.input = {};
			command._.forEach((input: string) => {
				const equalsIndex = input.indexOf('=');
				const value = input.substr(equalsIndex + 1);
				let key = input.substr(0, equalsIndex);
				if (!key) {
					key = basename(input);
					if (key.endsWith('.js')) key = key.substr(0, key.length - 3);
					else if (key.endsWith('.mjs')) key = key.substr(0, key.length - 4);
				}
				command.input[key] = value;
			});
		}
		command._ = [];
	} else if (command._.length === 1) {
		command.input = command._[0];
	}

	if (command.environment) {
		const environment = Array.isArray(command.environment)
			? command.environment
			: [command.environment];

		environment.forEach((arg: string) => {
			arg.split(',').forEach((pair: string) => {
				const [key, value] = pair.split(':');
				if (value) {
					process.env[key] = value;
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

		loadConfigFile(configFile, command)
			.then(configs => execute(configFile, configs, command))
			.catch(handleError);
	} else {
		return execute(configFile, [{ input: null }], command);
	}
}

function execute(configFile: string, configs: InputOptions[], command: any) {
	if (command.watch) {
		watch(configFile, configs, command, command.silent);
	} else {
		return sequence(configs, config => {
			const warnings = batchWarnings();
			const { inputOptions, outputOptions, deprecations, optionError } = mergeOptions({
				config,
				command,
				defaultOnWarnHandler: warnings.add
			});

			if (deprecations.length) {
				inputOptions.onwarn({
					code: 'DEPRECATED_OPTIONS',
					message: `The following options have been renamed — please update your config: ${deprecations
						.map(option => `${option.old} -> ${option.new}`)
						.join(', ')}`,
					deprecations
				});
			}

			if (optionError) inputOptions.onwarn({ code: 'UNKNOWN_OPTION', message: optionError });

			return build(inputOptions, outputOptions, warnings, command.silent);
		});
	}
}
