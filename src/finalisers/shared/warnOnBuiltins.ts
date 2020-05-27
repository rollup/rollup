import { ChunkDependencies } from '../../Chunk';
import { RollupWarning } from '../../rollup/types';

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
) {
	const externalBuiltins = dependencies.map(({ id }) => id).filter(id => id in builtins);

	if (!externalBuiltins.length) return;

	const detail =
		externalBuiltins.length === 1
			? `module ('${externalBuiltins[0]}')`
			: `modules (${externalBuiltins
					.slice(0, -1)
					.map(name => `'${name}'`)
					.join(', ')} and '${externalBuiltins.slice(-1)}')`;

	warn({
		code: 'MISSING_NODE_BUILTINS',
		message: `Creating a browser bundle that depends on Node.js built-in ${detail}. You might need to include https://github.com/ionic-team/rollup-plugin-node-polyfills`,
		modules: externalBuiltins
	});
}
