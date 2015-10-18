import { encode, decode } from 'sourcemap-codec';

function traceSegment ( loc, mappings ) {
	const line = loc[0];
	const column = loc[1];

	const segments = mappings[ line ];

	if ( !segments ) return null;

	for ( let i = 0; i < segments.length; i += 1 ) {
		const segment = segments[i];

		if ( segment[0] > column ) return null;

		if ( segment[0] === column ) {
			if ( segment[1] !== 0 ) {
				throw new Error( 'Bad sourcemap' );
			}

			return [ segment[2], segment[3] ];
		}
	}

	return null;
}

export default function collapseSourcemaps ( map, modules ) {
	const chains = modules.map( module => {
		return module.sourceMapChain.map( map => {
			if ( !map ) throw new Error( 'Cannot generate a sourcemap if non-sourcemap-generating transformers are used' );
			return decode( map.mappings );
		});
	});

	const decodedMappings = decode( map.mappings );

	const tracedMappings = decodedMappings.map( line => {
		let tracedLine = [];

		line.forEach( segment => {
			const sourceIndex = segment[1];
			const sourceCodeLine = segment[2];
			const sourceCodeColumn = segment[3];

			const chain = chains[ sourceIndex ];

			let i = chain.length;
			let traced = [ sourceCodeLine, sourceCodeColumn ];

			while ( i-- && traced ) {
				traced = traceSegment( traced, chain[i] );
			}

			if ( traced ) {
				tracedLine.push([
					segment[0],
					segment[1],
					traced[0],
					traced[1]
					// TODO name?
				]);
			}
		});

		return tracedLine;
	});

	map.sourcesContent = modules.map( module => module.originalCode );
	map.mappings = encode( tracedMappings );
	return map;
}
