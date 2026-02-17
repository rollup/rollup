export function wait(ms: number): Promise<void>;
export function withTimeout(promise: Promise<unknown>, timeoutMs: number, onTimeout: () => unknown): Promise<unknown>;
export function compareError(actual: RollupError, expected: RollupError): void;
export function compareLogs(actual: (RollupLog & {
    level: LogLevel;
})[], expected: (RollupLog & {
    level: LogLevel;
})[]): void;
export function getBundleCode(bundle: any, { format }?: {
    format?: string;
}): Promise<any>;
export function executeBundle(bundle: any, require: any): Promise<{}>;
export function getObject(entries: Iterable<[string, any]>): Record<string, any>;
export function loader(modules: Record<string, string>): Plugin;
export function normaliseOutput(code: any): any;
export function assertDirectoriesAreEqual(actualDirectory: string, expectedDirectory: string): void;
export function assertIncludes(actual: string, expected: string): void;
export function assertDoesNotInclude(actual: string, expected: string): void;
export function writeAndSync(filePath: string, contents: string): void;
export function writeAndRetry(filePath: string, contents: string): () => void;
export function replaceDirectoryInStringifiedObject(object: any, replaced: any): string;
export const hasEsBuild: boolean;
export namespace verifyAstPlugin {
    let name: string;
    function moduleParsed({ ast, code }: {
        ast: any;
        code: any;
    }): void;
}
export function getRandomElement(array: any): any;
export function shuffle(array: any): any;
export type RollupError = import("../src/rollup/types").RollupError;
export type RollupLog = import("../src/rollup/types").RollupLog;
export type LogLevel = import("../src/rollup/types").LogLevel;
export type Plugin = import("../src/rollup/types").Plugin;
export type TestConfigBase = import("./types").TestConfigBase;
/**
 * @param {string} stringValue
 */
export function deindent(stringValue: string): string;
/**
 * @template {TestConfigBase} C
 * @param {string} suiteName
 * @param {string} samplesDirectory
 * @param {(directory: string, config: C) => void} runTest
 * @param {() => void | Promise<void>} [onTeardown]
 */
export function runTestSuiteWithSamples<C extends TestConfigBase>(suiteName: string, samplesDirectory: string, runTest: (directory: string, config: C) => void, onTeardown?: () => void | Promise<void>): void;
export namespace runTestSuiteWithSamples {
    /**
     * @template {TestConfigBase} C
     * @param {string} suiteName
     * @param {string} samplesDirectory
     * @param {(directory: string, config: C) => void} runTest
     * @param {() => void | Promise<void>} onTeardown
     */
    function only<C extends TestConfigBase>(suiteName: string, samplesDirectory: string, runTest: (directory: string, config: C) => void, onTeardown: () => void | Promise<void>): void;
    /**
     * @param {string} suiteName
     */
    function skip(suiteName: string): void;
}
/**
 * @param {string} directory
 */
export function getFileNamesAndRemoveOutput(directory: string): string[];
export function assertFilesAreEqual(actualFiles: any, expectedFiles: any, directories?: any[]): void;
/**
 * Workaround a race condition in fs.writeFileSync that temporarily creates
 * an empty file for a brief moment which may be read by rollup watch - even
 * if the content being overwritten is identical.
 *
 * @param {string} filePath
 * @param {string} contents
 */
export function atomicWriteFileSync(filePath: string, contents: string): void;
