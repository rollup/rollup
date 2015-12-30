import { encode, decode } from 'sourcemap-codec';

function Source ( map, sources ) {
	if ( !map ) throw new Error( 'Cannot generate a sourcemap if non-sourcemap-generating transformers are used' );

	this.sources = sources;
	this.names = map.names;
	this.mappings = decode( map.mappings );
}

Source.prototype = { // TODO bring into line with others post-https://github.com/rollup/rollup/pull/386
	traceMappings () {
		return this.mappings.map( line => {
			let tracedLine = [];

			line.forEach( segment => {
				const source = this.sources[ segment[1] ];

				const sourceCodeLine = segment[2];
				const sourceCodeColumn = segment[3];

				const traced = source.traceSegment( sourceCodeLine, sourceCodeColumn );

				if ( traced ) {
					tracedLine.push([
						segment[0],
						traced.index,
						traced.line,
						traced.column
						// TODO name?
					]);
				}
			});

			return tracedLine;
		});
	},

	traceSegment ( line, column ) {
		const segments = this.mappings[ line ];

		if ( !segments ) return null;

		for ( let i = 0; i < segments.length; i += 1 ) {
			const segment = segments[i];

			if ( segment[0] > column ) return null;

			if ( segment[0] === column ) {
				const source = this.sources[ segment[1] ];

				if ( !source ) throw new Error( 'Bad sourcemap' );

				if ( source.isOriginal ) {
					return { index: source.index, line: segment[2], column: segment[3] };
				}

				return source.traceSegment( segment[2], segment[3] );
			}
		}

		return null;
	}
};

export default function collapseSourcemaps ( map, modules, bundleSourcemapChain ) {
	const sources = modules.map( ( module, i ) => {
		let source = { isOriginal: true, index: i };

		module.sourceMapChain.forEach( map => {
			source = new Source( map, [ source ]);
		});

		return source;
	});

	let source = new Source( map, sources );

	bundleSourcemapChain.forEach( map => {
		source = new Source( map, [ source ] );
	});

	// we re-use the `map` object because it has convenient toString/toURL methods
	map.sourcesContent = modules.map( module => module.originalCode );
	map.mappings = encode( source.traceMappings() );
	return map;
}
