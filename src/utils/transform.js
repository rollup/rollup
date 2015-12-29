import Promise from 'es6-promise/lib/es6-promise/promise.js';

export default function transform ( source, id, transformers ) {
	let sourceMapChain = [];

	if ( typeof source === 'string' ) {
		source = {
			code: source,
			ast: null
		};
	}

	let originalCode = source.code;
	let ast = source.ast;

	return transformers.reduce( ( promise, transformer ) => {
		return promise.then( previous => {
			return Promise.resolve( transformer( previous, id ) ).then( result => {
				if ( result == null ) return previous;

				if ( typeof result === 'string' ) {
					result = {
						code: result,
						ast: null,
						map: null
					};
				}
				// `result.map` can only be a string if `result` isn't
				else if ( typeof result.map === 'string' ) {
					result.map = JSON.parse( result.map );
				}

				sourceMapChain.push( result.map );
				ast = result.ast;

				return result.code;
			});
		});

	}, Promise.resolve( source.code ) )

	.then( code => ({ code, originalCode, ast, sourceMapChain }) );
}
