import { decode } from 'sourcemap-codec';

export default function transformBundle ( code, plugins, sourceMapChain, options ) {
	const format = options.format;

	return plugins.reduce( ( prevCode, plugin ) => {


		return prevCode
			.then(code => {
				if ( !plugin.transformBundle ) return code;

				return Promise.resolve(plugin.transformBundle( code, { format } ))

					.then(result => {
						if ( result == null ) return prevCode;

						if ( typeof result === 'string' ) {
							result = {
								code: result,
								map: null
							};
						}

						const map = typeof result.map === 'string' ? JSON.parse( result.map ) : result.map;
						if ( map && typeof map.mappings === 'string' ) {
							map.mappings = decode( map.mappings );
						}

						sourceMapChain.push( map );

						return result.code;
					});
			})
			.catch(err => {
				if ( !err.rollupTransformBundle ) {
					err.rollupTransformBundle = true;
					err.plugin = plugin.name;
					err.message = `Error transforming bundle${plugin.name ? ` with '${plugin.name}' plugin` : ''}: ${err.message}`;
				}
				throw err;
			});
	}, Promise.resolve(code) );
}
