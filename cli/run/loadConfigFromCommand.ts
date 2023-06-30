import process from 'node:process';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { mergeOptions } from '../../src/utils/options/mergeOptions';
import batchWarnings from './batchWarnings';
import { addCommandPluginsToInputOptions } from './commandPlugins';
import type { BatchWarnings } from './loadConfigFileType';
import { stdinName } from './stdin';

export default async function loadConfigFromCommand(
	commandOptions: Record<string, unknown>,
	watchMode: boolean
): Promise<{
	options: MergedRollupOptions[];
	warnings: BatchWarnings;
}> {
	const warnings = batchWarnings(commandOptions);
	if (!commandOptions.input && (commandOptions.stdin || !process.stdin.isTTY)) {
		commandOptions.input = stdinName;
	}
	const options = await mergeOptions({ input: [] }, watchMode, commandOptions, warnings.log);
	await addCommandPluginsToInputOptions(options, commandOptions);
	return { options: [options], warnings };
}
