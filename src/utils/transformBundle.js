import { decode } from 'sourcemap-codec';
import error from './error.js';

export default function transformBundle ( code, plugins, sourceMapChain, options ) {
	return plugins.reduce( ( code, plugin ) => {
		if ( !plugin.transformBundle ) return code;

		let result;

		try {
			result = plugin.transformBundle( code, { format : options.format } );
		} catch ( err ) {
			error({
				code: 'BAD_BUNDLE_TRANSFORMER',
				message: `Error transforming bundle${plugin.name ? ` with '${plugin.name}' plugin` : ''}: ${err.message}`,
				plugin: plugin.name
			});
		}

		if ( result == null ) return code;

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
	}, code );
}
