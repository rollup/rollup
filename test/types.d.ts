/* eslint-disable @typescript-eslint/member-ordering */
import type { SourceMap } from 'magic-string';
import type { RollupError, RollupOptions } from '../src/rollup/types';

export interface RollupTestConfig {
	/**
	 * Only run this test. Should never be committed.
	 */
	solo?: boolean;
	/**
	 * Skip this test.
	 */
	skip?: boolean;

	execute?: boolean;

	/**
	 * Description of the test.
	 */
	description: string;
	/**
	 * The command to run for the test.
	 */
	command?: string;
	/**
	 * Rollup options
	 */
	options?: RollupOptions;
	/**
	 * Bundle formats to test.
	 */
	formats?: string[];
	/**
	 * Environment variables to set for the test.
	 */
	env?: Record<string, string | undefined>;
	/**
	 * The directory to run the test in.
	 */
	nestedDir?: string;

	/**
	 * Called before the test is run.
	 */
	before?: () => void | Promise<void>;
	/**
	 * Called after the test is run.
	 */
	after?: () => void | Promise<void>;
	/**
	 * Assert the stderr of the build.
	 */
	stderr?: (stderr: string) => void | Promise<void>;
	/**
	 * Assert the stderr stream, return true to abort the test.
	 */
	abortOnStderr?: (data: string) => boolean | void | Promise<boolean | void>;

	/**
	 * Execute the AMD module.
	 */
	runAmd?:
		| boolean
		| {
				exports?: (exportObject: any) => void | Promise<void>;
		  };

	/**
	 * Test the expected error.
	 */
	error?: RollupError | ((error: RollupError) => boolean | void);
	/**
	 * Test the expected warnings.
	 */
	warnings?: RollupError[] | ((warnings: RollupError[]) => boolean | void);
	/**
	 * Expected warning codes
	 */
	expectedWarnings?: string[];
	/**
	 * Test the output of the build.
	 */
	test?: (code: string, map: SourceMap) => void | Promise<void>;
	/**
	 * Assetions for the exports of the bundle.
	 */
	exports?: (exportObject: any) => void | Promise<void>;

	skipIfWindows?: boolean;
	onlyWindows?: boolean;
	minNodeVersion?: string;

	options1?: RollupOptions;
	options2?: RollupOptions;
}

declare global {
	/**
	 * Define configuration for a test.
	 * This function is available globally in the test files.
	 */
	function defineRollupTest(config: RollupTestConfig): RollupTestConfig;
}
