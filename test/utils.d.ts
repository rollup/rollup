import type * as Rollup from '../src/rollup/types';
import type { RollupTestConfig } from './types';

type RunTestFunction = (directory: string, config: RollupTestConfig) => void;

export const rollup: typeof Rollup;

export function runTestSuiteWithSamples(
	suiteName: string,
	samplesDirectory: string,
	test: RunTestFunction,
	onTeardown: () => void | Promise<void>
): void;

export function assertIncludes(code: string, snippet: string): void;

export function atomicWriteFileSync(file: string, content: string): void;
