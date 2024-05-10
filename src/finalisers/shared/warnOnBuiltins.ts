import builtinModules from 'builtin-modules';
import type { ChunkDependency } from '../../Chunk';
import type { LogHandler } from '../../rollup/types';
import { LOGLEVEL_WARN } from '../../utils/logging';
import { logMissingNodeBuiltins } from '../../utils/logs';

const nodeBuiltins: ReadonlySet<string> = new Set(builtinModules);

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
