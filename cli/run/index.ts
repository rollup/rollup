import { MergedRollupOptions } from '../../src/rollup/types';
import { getAliasName } from '../../src/utils/relativeId';
import { loadFsEvents } from '../../src/watch/fsevents-importer';
import { handleError } from '../logging';
import { BatchWarnings } from './batchWarnings';
import build from './build';
import { getConfigPath } from './getConfigPath';
import loadAndParseConfigFile from './loadConfigFile';
import loadConfigFromCommand from './loadConfigFromCommand';

export default async function runRollup(command: Record<string, any>): Promise<void> {
	let inputSource;
	if (command._.length > 0) {
		if (command.input) {
			handleError({
				code: 'DUPLICATE_IMPORT_OPTIONS',
				message: 'Either use --input, or pass input path as argument'
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

	if (command.watch) {
		await loadFsEvents();
		const { watch } = await import('./watch-cli');
		watch(command);
	} else {
		try {
			const { options, warnings } = await getConfigs(command);
			try {
				for (const inputOptions of options) {
					await build(inputOptions, warnings, command.silent);
				}
				if (command.failAfterWarnings && warnings.warningOccurred) {
					warnings.flush();
					handleError({
						code: 'FAIL_AFTER_WARNINGS',
						message: 'Warnings occurred and --failAfterWarnings flag present'
					});
				}
			} catch (err: any) {
				warnings.flush();
				handleError(err);
			}
		} catch (err: any) {
			handleError(err);
		}
	}
}

async function getConfigs(
	command: any
): Promise<{ options: MergedRollupOptions[]; warnings: BatchWarnings }> {
	if (command.config) {
		const configFile = getConfigPath(command.config);
		const { options, warnings } = await loadAndParseConfigFile(configFile, command);
		return { options, warnings };
	}
	return await loadConfigFromCommand(command);
}
