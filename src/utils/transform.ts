import { decode } from 'sourcemap-codec';
import { locate } from 'locate-character';
import error from './error';
import getCodeFrame from './getCodeFrame';

export default function transform ( bundle, source, id, plugins ) {
	const sourcemapChain = [];

	const originalSourcemap = typeof source.map === 'string' ? JSON.parse( source.map ) : source.map;

	if ( originalSourcemap && typeof originalSourcemap.mappings === 'string' ) {
		originalSourcemap.mappings = decode( originalSourcemap.mappings );
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

				if ( object.code ) object.pluginCode = object.code;
				object.code = code;

				if ( pos !== undefined ) {
					if ( pos.line !== undefined && pos.column !== undefined ) {
						const { line, column } = pos;
						object.loc = { file: id, line, column };
						object.frame = getCodeFrame( previous, line, column );
					}
					else {
						object.pos = pos;
						const { line, column } = locate( previous, pos, { offsetLine: 1 });
						object.loc = { file: id, line, column };
						object.frame = getCodeFrame( previous, line, column );
					}
				}

				object.plugin = plugin.name;
				object.id = id;

				return object;
			}

			let throwing;

			const context = {
				warn: ( warning, pos ) => {
					warning = augment( warning, pos, 'PLUGIN_WARNING' );
					bundle.warn( warning );
				},

				error ( err, pos ) {
					err = augment( err, pos, 'PLUGIN_ERROR' );
					throwing = true;
					error( err );
				}
			};

			let transformed;

			try {
				transformed = plugin.transform.call( context, previous, id );
			} catch ( err ) {
				if ( !throwing ) context.error( err );
				error( err );
			}

			return Promise.resolve( transformed )
				.then( result => {
					if ( result == null ) return previous;

					if ( typeof result === 'string' ) {
						result = {
							code: result,
							ast: undefined,
							map: undefined
						};
					}

					// `result.map` can only be a string if `result` isn't
					else if ( typeof result.map === 'string' ) {
						result.map = JSON.parse( result.map );
					}

					if ( result.map && typeof result.map.mappings === 'string' ) {
						result.map.mappings = decode( result.map.mappings );
					}

					// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
					if ( result.map !== null ) {
						sourcemapChain.push( result.map || { missing: true, plugin: plugin.name });
					}

					ast = result.ast;

					return result.code;
				})
				.catch( err => {
					err = augment( err, undefined, 'PLUGIN_ERROR' );
					error( err );
				});
		});
	});

	return promise.then( code => ({ code, originalCode, originalSourcemap, ast, sourcemapChain }) );
}
