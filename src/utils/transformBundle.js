import MagicString from 'magic-string';

export default function transformBundle ( source, transformers ) {
	if ( typeof source === 'string' ) {
		source = {
			code: source,
			map: null
		};
	}

	return transformers.reduce( ( previous, transformer ) => {
		let result = transformer( previous.code, previous.map );

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

		if (result.map != null) {
			let map = new MagicString.Bundle().generateMap({});
			map.file = result.map.file;
			map.sources = result.map.sources;
			map.sourcesContent = result.map.sourcesContent;
			map.names = result.map.names;
			map.mappings = result.map.mappings;
			result.map = map;
		}

		return result;
	}, source );
}
