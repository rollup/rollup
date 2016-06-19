export default function transform ( source, id, transformers ) {
	let sourceMapChain = [];

	const originalSourceMap = typeof source.map === 'string' ? JSON.parse( source.map ) : source.map;

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

	.then( code => ({ code, originalCode, originalSourceMap, ast, sourceMapChain }) )
	.catch( err => {
		err.id = id;
		err.message = `Error loading ${id}: ${err.message}`;
		throw err;
	});
}
