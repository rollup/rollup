import { ChunkDependency } from '../../Chunk';
import type { RollupWarning } from '../../rollup/types';
import { errMissingNodeBuiltins } from '../../utils/error';

const builtins = {
	assert: true,
	buffer: true,
	console: true,
	constants: true,
	domain: true,
	events: true,
	http: true,
	https: true,
	os: true,
	path: true,
	process: true,
	punycode: true,
	querystring: true,
	stream: true,
	string_decoder: true,
	timers: true,
	tty: true,
	url: true,
	util: true,
	vm: true,
	zlib: true
};

export default function warnOnBuiltins(
	warn: (warning: RollupWarning) => void,
	dependencies: ChunkDependency[]
): void {
	const externalBuiltins = dependencies
		.map(({ importPath }) => importPath)
		.filter(importPath => importPath in builtins);

	if (!externalBuiltins.length) return;

	warn(errMissingNodeBuiltins(externalBuiltins));
}
