const builtins = {
	process: true,
	events: true,
	stream: true,
	util: true,
	path: true,
	buffer: true,
	querystring: true,
	url: true,
	string_decoder: true,
	punycode: true,
	http: true,
	https: true,
	os: true,
	assert: true,
	constants: true,
	timers: true,
	console: true,
	vm: true,
	zlib: true,
	tty: true,
	domain: true
};

// Creating a browser bundle that depends on Node.js built-in modules ('util'). You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins

export default function warnOnBuiltins ( bundle ) {
	const externalBuiltins = bundle.externalModules
		.filter( mod => mod.id in builtins )
		.map( mod => mod.id );

	if ( !externalBuiltins.length ) return;

	const detail = externalBuiltins.length === 1 ?
		`module ('${externalBuiltins[0]}')` :
		`modules (${externalBuiltins.slice( 0, -1 ).map( name => `'${name}'` ).join( ', ' )} and '${externalBuiltins.pop()}')`;

	bundle.warn({
		code: 'MISSING_NODE_BUILTINS',
		message: `Creating a browser bundle that depends on Node.js built-in ${detail}. You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins`
	});
}
