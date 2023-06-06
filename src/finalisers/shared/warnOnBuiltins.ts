import builtinModules from 'builtin-modules/static';
import type { ChunkDependency } from '../../Chunk';
import type { LogHandler } from '../../rollup/types';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logMissingNodeBuiltins } from '../../utils/logs';

const nodeBuiltins: ReadonlySet<string> = new Set([
	...builtinModules,
	// TODO
	// remove once builtin-modules includes PR: https://github.com/sindresorhus/builtin-modules/pull/17
	'assert/strict',
	'dns/promises',
	'fs/promises',
	'path/posix',
	'path/win32',
	'readline/promises',
	'stream/consumers',
	'stream/promises',
	'stream/web',
	'timers/promises',
	'util/types'
]);

export default function warnOnBuiltins(
	log: LogHandler,
	dependencies: readonly ChunkDependency[]
): void {
	const externalBuiltins = dependencies
		.map(({ importPath }) => importPath)
		.filter(importPath => nodeBuiltins.has(importPath) || importPath.startsWith('node:'));

	if (externalBuiltins.length === 0) return;

	log(LOGLEVEL_WARN, logMissingNodeBuiltins(externalBuiltins));
}
