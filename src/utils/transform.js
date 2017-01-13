import { decode } from 'sourcemap-codec';
import { locate } from 'locate-character';
import error from './error.js';
import getCodeFrame from './getCodeFrame.js';

export default function transform ( bundle, source, id, plugins ) {
	const sourceMapChain = [];

	const originalSourceMap = typeof source.map === 'string' ? JSON.parse( source.map ) : source.map;

	if ( originalSourceMap && typeof originalSourceMap.mappings === 'string' ) {
		originalSourceMap.mappings = decode( originalSourceMap.mappings );
	}

	const originalCode = source.code;
	let ast = source.ast;

	let promise = Promise.resolve( source.code );

	plugins.forEach( plugin => {
		if ( !plugin.transform ) return;

		promise = promise.then( previous => {
			function augment ( object, pos, code ) {
				if ( typeof object === 'string' ) {
					object = { message: object };
				}

				if ( !object.code ) object.code = code;

				if ( pos !== undefined ) {
					object.pos = pos;
					const { line, column } = locate( previous, pos, { offsetLine: 1 });
					object.loc = { file: id, line, column };
					object.frame = getCodeFrame( previous, line, column );
				}

				return object;
			}

			let err;

			const context = {
				warn: ( warning, pos ) => {
					warning = augment( warning, pos, 'PLUGIN_WARNING' );
					warning.plugin = plugin.name;
					warning.id = id;
					bundle.warn( warning );
				},

				error ( e, pos ) {
					err = augment( e, pos, 'PLUGIN_ERROR' );
				}
			};

			let transformed;

			try {
				transformed = plugin.transform.call( context, previous, id );
			} catch ( err ) {
				context.error( err );
			}

			return Promise.resolve( transformed )
				.then( result => {
					if ( err ) throw err;

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
				})
				.catch( err => {
					err.plugin = plugin.name;
					err.id = id;
					error( err );
				});
		});
	});

	return promise.then( code => ({ code, originalCode, originalSourceMap, ast, sourceMapChain }) );
}
