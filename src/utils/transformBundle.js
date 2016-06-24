export default function transformBundle ( code, plugins, sourceMapChain ) {
	return plugins.reduce( ( code, plugin ) => {
		if ( !plugin.transformBundle ) return code;

		let result;

		try {
			result = plugin.transformBundle( code );
		} catch ( err ) {
			err.plugin = plugin.name;
			err.message = `Error transforming bundle${plugin.name ? ` with '${plugin.name}' plugin` : ''}: ${err.message}`;
			throw err;
		}

		if ( result == null ) return code;

		if ( typeof result === 'string' ) {
			result = {
				code: result,
				map: null
			};
		}

		const map = typeof result.map === 'string' ? JSON.parse( result.map ) : result.map;
		sourceMapChain.push( map );

		return result.code;
	}, code );
}
