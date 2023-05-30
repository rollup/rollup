import type { LogHandler, MergedRollupOptions, RollupWarning } from '../../src/rollup/types';

export interface BatchWarnings {
	add: (warning: RollupWarning) => void;
	readonly count: number;
	flush: () => void;
	log: LogHandler;
	readonly warningOccurred: boolean;
}

export type LoadConfigFile = typeof loadConfigFile;

export function loadConfigFile(
	fileName: string,
	commandOptions: any
): Promise<{
	options: MergedRollupOptions[];
	warnings: BatchWarnings;
}>;
