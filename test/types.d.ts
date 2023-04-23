/* eslint-disable @typescript-eslint/member-ordering */
import type { SourceMap } from 'magic-string';
import type { RollupError, RollupOptions } from '../src/rollup/types';

export interface TestConfigBase {
	/**
	 * Only run this test. Should never be committed.
	 */
	solo?: boolean;
	/**
	 * Skip this test.
	 */
	skip?: boolean;
	/**
	 * Execute the bundled code.
	 */
	execute?: boolean;

	/**
	 * Description of the test.
	 */
	description: string;
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
	 * The global context executed the bundled code.
	 */
	context?: Record<string, any>;
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
	 * Test the expected error.
	 */
	error?: RollupError | ((error: RollupError) => boolean | void);
	generateError?: RollupError;
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
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestConfigForm extends TestConfigBase {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestConfigSourcemap extends TestConfigBase {}

export interface TestConfigFileHash extends TestConfigBase {
	options1?: RollupOptions;
	options2?: RollupOptions;
	show?: boolean;
}

export interface TestConfigCli extends TestConfigBase {
	command?: string;
	cwd?: string;
	retry?: number;
	/**
	 * Assert the stderr of the build.
	 */
	stderr?: (stderr: string) => void | Promise<void>;
	/**
	 * Assert the stderr stream, return true to abort the test.
	 */
	abortOnStderr?: (data: string) => boolean | void | Promise<boolean | void>;

	result?: (code: string) => void;
}

export interface TestConfigChunkingForm extends TestConfigBase {
	/**
	 * Execute the AMD module.
	 */
	runAmd?:
		| boolean
		| {
				exports?: (exportObject: any) => void | Promise<void>;
		  };
}

export interface TestConfigFunction extends TestConfigBase {
	runtimeError?(error: Error): void;
}

export type RunTestFunction = <C extends TestConfigBase>(directory: string, config: C) => void;
