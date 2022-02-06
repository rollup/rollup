import type { ChunkDependencies } from '../../Chunk';
import type { RollupWarning } from '../../rollup/types';
import { printQuotedStringList } from '../../utils/printStringList';

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
	dependencies: ChunkDependencies
): void {
	const externalBuiltins = dependencies.map(({ id }) => id).filter(id => id in builtins);

	if (!externalBuiltins.length) return;

	warn({
		code: 'MISSING_NODE_BUILTINS',
		message: `Creating a browser bundle that depends on Node.js built-in modules (${printQuotedStringList(
			externalBuiltins
		)}). You might need to include https://github.com/snowpackjs/rollup-plugin-polyfill-node`,
		modules: externalBuiltins
	});
}
