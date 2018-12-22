import { realpathSync } from 'fs';
import relative from 'require-relative';
import { InputOptions } from '../../../src/rollup/types';
import mergeOptions from '../../../src/utils/mergeOptions';
import { getAliasName } from '../../../src/utils/relativeId';
import { handleError } from '../logging';
import batchWarnings from './batchWarnings';
import build from './build';
import loadConfigFile from './loadConfigFile';
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
		return execute(configFile, <any>[{ input: null }], command);
	}
}

function execute(configFile: string, configs: InputOptions[], command: any) {
	if (command.watch) {
		watch(configFile, configs, command, command.silent);
	} else {
		let promise = Promise.resolve();
		for (const config of configs) {
			promise = promise.then(() => {
				const warnings = batchWarnings();
				const { inputOptions, outputOptions, optionError } = mergeOptions({
					config,
					command,
					defaultOnWarnHandler: warnings.add
				});

				if (optionError) inputOptions.onwarn({ code: 'UNKNOWN_OPTION', message: optionError });
				return build(inputOptions, outputOptions, warnings, command.silent);
			});
		}
		return promise;
	}
}
