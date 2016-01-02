export default function transformBundle ( code, transformers, sourceMapChain ) {
	return transformers.reduce( ( code, transformer ) => {
		let result = transformer( code );

		if ( result == null ) return code;

		if ( typeof result === 'string' ) {
			result = {
				code: result,
				map: null
			};
		}

		const map = typeof result.map === 'string' ? JSON.parse( result.map ) : map;
		sourceMapChain.push( map );

		return result.code;
	}, code );
}
