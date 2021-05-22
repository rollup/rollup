import { MergedRollupOptions } from '../../src/rollup/types';
import { mergeOptions } from '../../src/utils/options/mergeOptions';
import batchWarnings, { BatchWarnings } from './batchWarnings';
import { addCommandPluginsToInputOptions } from './commandPlugins';
import { stdinName } from './stdin';

export default function loadConfigFromCommand(
	command: Record<string, any>
): { options: MergedRollupOptions[]; warnings: BatchWarnings } {
	const warnings = batchWarnings();
	if (!command.input && (command.stdin || !process.stdin.isTTY)) {
		command.input = stdinName;
	}
	const options = mergeOptions({ input: [] }, command, warnings.add);
	addCommandPluginsToInputOptions(options, command);
	return { options: [options], warnings };
}
