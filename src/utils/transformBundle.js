export default function transformBundle ( source, transformers ) {
	if ( typeof source === 'string' ) {
		source = {
			code: source,
			map: null
		};
	}

	return transformers.reduce( ( previous, transformer ) => {
		let result = transformer( previous );

		if ( result == null ) return previous;

		if ( typeof result === 'string' ) {
			result = {
				code: result,
				map: null
			};
		}
		// `result.map` can only be a string if `result` isn't
		else if ( typeof result.map === 'string' ) {
			result.map = JSON.parse( result.map );
		}

		return result;

	}, source );
}
