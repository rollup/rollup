/* eslint-disable @typescript-eslint/member-ordering */
import type { SourceMap } from 'magic-string';
import type { RollupError, RollupOptions } from '../src/rollup/types';

export interface RollupTestConfig {
	solo?: boolean;
	description: string;
	command?: string;
	options?: RollupOptions;
	error?: RollupError;
	test?: (code: string, map: SourceMap) => void | Promise<void>;

	skipIfWindows?: boolean;
	onlyWindows?: boolean;
	minNodeVersion?: string;
}

declare global {
	function defineRollupTest(config: RollupTestConfig): RollupTestConfig;
}
