import { MergedRollupOptions } from '../../src/rollup/types';
import { mergeOptions } from '../../src/utils/mergeOptions';
import { getAliasName } from '../../src/utils/relativeId';
import { handleError } from '../logging';
import batchWarnings, { BatchWarnings } from './batchWarnings';
import build from './build';
import { addCommandPluginsToInputOptions } from './commandPlugins';
import { getConfigPath } from './getConfigPath';
import loadAndParseConfigFile from './loadConfigFile';
import { stdinName } from './stdin';
import watch from './watch';

export default async function runRollup(command: any) {
	let inputSource;
	if (command._.length > 0) {
		if (command.input) {
			handleError({
				code: 'DUPLICATE_IMPORT_OPTIONS',
				message: 'Either use --input, or pass input path as argument',
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

	if (command.watch) process.env.ROLLUP_WATCH = 'true';
	try {
		const { configFile, options, warnings } = await getConfigs(command);
		try {
			await execute(configFile, options, command, warnings);
		} catch (err) {
			warnings.flush();
			handleError(err);
		}
	} catch (err) {
		handleError(err);
	}
}

async function getConfigs(
	command: any
): Promise<{ configFile: string | null; options: MergedRollupOptions[]; warnings: BatchWarnings }> {
	if (command.config) {
		const configFile = getConfigPath(command.config);
		const { options, warnings } = await loadAndParseConfigFile(configFile, command);
		return { configFile, options, warnings };
	}
	const warnings = batchWarnings();
	if (!command.input && (command.stdin || !process.stdin.isTTY)) {
		command.input = stdinName;
	}
	const options = mergeOptions({ input: [] }, command, warnings.add);
	addCommandPluginsToInputOptions(options, command);
	return { configFile: null, options: [options], warnings };
}

async function execute(
	configFile: string | null,
	configs: MergedRollupOptions[],
	command: any,
	warnings: BatchWarnings
): Promise<void> {
	if (command.watch) {
		watch(configFile, configs, command, warnings, command.silent);
	} else {
		for (const inputOptions of configs) {
			await build(inputOptions, warnings, command.silent);
		}
	}
}
