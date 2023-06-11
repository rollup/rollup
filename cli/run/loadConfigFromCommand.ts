import process from 'node:process';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { mergeOptions } from '../../src/utils/options/mergeOptions';
import batchWarnings from './batchWarnings';
import { addCommandPluginsToInputOptions } from './commandPlugins';
import type { BatchWarnings } from './loadConfigFileType';
import { stdinName } from './stdin';

export default async function loadConfigFromCommand(
	command: Record<string, unknown>,
	watchMode: boolean
): Promise<{
	options: MergedRollupOptions[];
	warnings: BatchWarnings;
}> {
	const warnings = batchWarnings(!!command.silent);
	if (!command.input && (command.stdin || !process.stdin.isTTY)) {
		command.input = stdinName;
	}
	const options = await mergeOptions({ input: [] }, watchMode, command, warnings.log);
	await addCommandPluginsToInputOptions(options, command);
	return { options: [options], warnings };
}
