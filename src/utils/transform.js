export default function transform ( source, id, plugins ) {
	let sourceMapChain = [];

	const originalSourceMap = typeof source.map === 'string' ? JSON.parse( source.map ) : source.map;

	let originalCode = source.code;
	let ast = source.ast;

	return plugins.reduce( ( promise, plugin ) => {
		return promise.then( previous => {
			if ( !plugin.transform ) return previous;

			return Promise.resolve( plugin.transform( previous, id ) ).then( result => {
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

				sourceMapChain.push( result.map || { missing: true, plugin: plugin.name }); // lil' bit hacky but it works
				ast = result.ast;

				return result.code;
			});
		}).catch( err => {
			err.id = id;
			err.plugin = plugin.name;
			err.message = `Error transforming ${id}${plugin.name ? ` with '${plugin.name}' plugin` : ''}: ${err.message}`;
			throw err;
		});
	}, Promise.resolve( source.code ) )

	.then( code => ({ code, originalCode, originalSourceMap, ast, sourceMapChain }) );
}
