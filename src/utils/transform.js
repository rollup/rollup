import { decode } from 'sourcemap-codec';
import error from './error.js';
import relativeId from './relativeId.js';

export default function transform ( source, id, plugins ) {
	const sourceMapChain = [];

	const originalSourceMap = typeof source.map === 'string' ? JSON.parse( source.map ) : source.map;

	if ( originalSourceMap && typeof originalSourceMap.mappings === 'string' ) {
		originalSourceMap.mappings = decode( originalSourceMap.mappings );
	}

	const originalCode = source.code;
	let ast = source.ast;
	let errored = false;

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

				if ( result.map && typeof result.map.mappings === 'string' ) {
					result.map.mappings = decode( result.map.mappings );
				}

				sourceMapChain.push( result.map || { missing: true, plugin: plugin.name }); // lil' bit hacky but it works
				ast = result.ast;

				return result.code;
			});
		}).catch( err => {
			// TODO this all seems a bit hacky
			if ( errored ) throw err;
			errored = true;

			err.plugin = plugin.name;
			throw err;
		});
	}, Promise.resolve( source.code ) )
		.catch( err => {
			error({
				code: 'BAD_TRANSFORMER',
				message: `Error transforming ${relativeId( id )}${err.plugin ? ` with '${err.plugin}' plugin` : ''}: ${err.message}`,
				plugin: err.plugin,
				id
			});
		})
		.then( code => ({ code, originalCode, originalSourceMap, ast, sourceMapChain }) );
}
