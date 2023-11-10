import type { SourceMap } from 'magic-string';
import type { RollupLog } from 'rollup';
import type { RollupBuild, RollupError, RollupOptions } from '../src/rollup/types';

export interface TestConfigBase {
	/**
	 * Description of the test. Determines the name of the test in the test
	 * runner.
	 */
	description: string;
	/**
	 * Only run this test if the major Node version is high enough.
	 */
	minNodeVersion?: number;
	/**
	 * Only run this test on Windows.
	 */
	onlyWindows?: boolean;
	/**
	 * Skip this test.
	 */
	skip?: boolean;
	/**
	 * Do not run this test on Windows.
	 */
	skipIfWindows?: boolean;
	/**
	 * Only run this test. Should never be committed.
	 */
	solo?: boolean;
}

export interface TestConfigBrowser extends TestConfigBase {
	/**
	 * Expected error when running rollup.rollup()
	 */
	error?: RollupError;
	/**
	 * Expected warning codes. Any of these warnings will not cause the test to
	 * fail.
	 */
	expectedWarnings?: string[];
	/**
	 * Expected error when running bundle.generate().
	 */
	generateError?: RollupError;
	/**
	 * Rollup options for bundling.
	 */
	options?: RollupOptions;
}

export interface TestConfigChunkingForm extends TestConfigBase {
	/**
	 * Called after the test is run.
	 */
	after?: () => void;
	/**
	 * Called before the test is run.
	 */
	before?: () => void;
	/**
	 * Expected warning codes. Any of these warnings will not cause the test to
	 * fail.
	 */
	expectedWarnings?: string[];
	/**
	 * Assert the expected logs.
	 */
	logs?: RollupLog[];
	/**
	 * The directory to bundle the code in.
	 */
	nestedDir?: string;
	/**
	 * Rollup options for bundling.
	 */
	options?: RollupOptions;
	/**
	 * Execute the AMD module.
	 */
	runAmd?:
		| boolean
		| {
				exports?: (exportObject: any) => void | Promise<void>;
		  };
}

export interface TestConfigCli extends TestConfigBase {
	/**
	 * Assert the stderr stream, return true to abort the test.
	 */
	abortOnStderr?: (data: string) => boolean | void | Promise<boolean | void>;
	/**
	 * Called after the test is run.
	 */
	after?: (error: Error | null, stdout: string, stderr: string) => void | Promise<void>;
	/**
	 * Called before the test is run.
	 */
	before?: () => void | Promise<void>;
	command?: string;
	cwd?: string;
	/**
	 * Environment variables to set for the test.
	 */
	env?: Record<string, string | boolean | undefined>;
	/**
	 * Test the expected error. Assertions about the test output will only
	 * be performed afterward if you return "true" or do not supply this option.
	 */
	error?: (error: Error) => boolean | void;
	/**
	 * Execute the bundled code.
	 */
	execute?: boolean;
	/**
	 * Run assertions against the exports of the bundle after executing it.
	 */
	exports?: (exportObject: any) => void | Promise<void>;
	/**
	 * Run assertions against the generated code when bundling to stdout.
	 */
	result?: (code: string) => void;
	retry?: number;
	/**
	 * Display generated output in console.
	 */
	show?: boolean;
	/**
	 * Assert the stderr of the build. Assertions about the test output will only
	 * be performed afterward if you return "true" or do not supply this option.
	 */
	stderr?: (stderr: string) => boolean | undefined;
	/**
	 * Run assertions after the command has finished.
	 */
	test?: () => void;
}

export interface TestConfigFileHash extends TestConfigBase {
	options1: RollupOptions;
	options2: RollupOptions;
}

export interface TestConfigForm extends TestConfigBase {
	/**
	 * Called after the test is run.
	 */
	after?: () => void | Promise<void>;
	/**
	 * Called before the test is run.
	 */
	before?: () => void | Promise<void>;
	/**
	 * Expected warning codes. Any of these warnings will not cause the test to
	 * fail.
	 */
	expectedWarnings?: string[];
	/**
	 * Output formats to test.
	 */
	formats?: string[];
	/**
	 * Assert the expected logs.
	 */
	logs?: RollupLog[];
	/**
	 * Rollup options for bundling.
	 */
	options?: RollupOptions;
	/**
	 * Verify that the AST returned by SWC is the same as the one returned by Acorn.
	 * The default behavior is to verify.
	 */
	verifyAst?: boolean;
}

export interface TestConfigFunction extends TestConfigBase {
	/**
	 * Called after the test is run.
	 */
	after?: () => void | Promise<void>;
	/**
	 * Called before the test is run.
	 */
	before?: () => void | Promise<void>;
	/**
	 * Make assertions against the generated Rollup output object.
	 */
	bundle?: (bundle: RollupBuild) => void | Promise<void>;
	/**
	 * Make assertions against the generated code.
	 */
	code?: (code: string | Record<string, string>) => void;
	/**
	 * The global context executed the bundled code.
	 */
	context?: Record<string, any>;
	/**
	 * Expected error when running rollup.rollup()
	 */
	error?: RollupError;
	/**
	 * Assetions for the exports of the bundle.
	 */
	exports?: (exportObject: any) => void | Promise<void>;
	/**
	 * Expected error when running bundle.generate().
	 */
	generateError?: RollupError;
	/**
	 * Assert the expected logs.
	 */
	logs?: RollupLog[];
	/**
	 * Rollup options for bundling.
	 */
	options?: RollupOptions;
	/**
	 * Make assertions against an expected runtime error.
	 */
	runtimeError?: (error: Error) => void;
	/**
	 * Display generated output in console.
	 */
	show?: boolean;
	/**
	 * Make assertions on the expected warnings.
	 */
	warnings?: RollupError[] | ((warnings: RollupError[]) => boolean | void);
	/**
	 * Verify that the AST returned by SWC is the same as the one returned by Acorn.
	 * The default behavior is to verify.
	 */
	verifyAst?: boolean;
}

export interface TestConfigSourcemap extends TestConfigBase {
	/**
	 * Output formats to test.
	 */
	formats?: string[];
	/**
	 * Rollup options for bundling.
	 */
	options?: RollupOptions;
	/**
	 * Generate the bundle and run assertions.
	 */
	test: (
		code: string,
		map: SourceMap,
		options: { fileName: string; format: string }
	) => void | Promise<void>;
	/**
	 * List expected warnings.
	 */
	warnings?: RollupError[];
}
