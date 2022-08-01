import { ChunkDependency } from '../../Chunk';
import type { RollupWarning } from '../../rollup/types';
import { errMissingNodeBuiltins } from '../../utils/error';

const builtins = {
	assert: 1,
	buffer: 1,
	console: 1,
	constants: 1,
	domain: 1,
	events: 1,
	http: 1,
	https: 1,
	os: 1,
	path: 1,
	process: 1,
	punycode: 1,
	querystring: 1,
	stream: 1,
	string_decoder: 1,
	timers: 1,
	tty: 1,
	url: 1,
	util: 1,
	vm: 1,
	zlib: 1
};

export default function warnOnBuiltins(
	warn: (warning: RollupWarning) => void,
	dependencies: ChunkDependency[]
): void {
	const externalBuiltins = dependencies
		.map(({ importPath }) => importPath)
		.filter(importPath => importPath in builtins || importPath.startsWith('node:'));

	if (!externalBuiltins.length) return;

	warn(errMissingNodeBuiltins(externalBuiltins));
}
