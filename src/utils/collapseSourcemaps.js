import { encode, decode } from 'sourcemap-codec';

function Source ( index ) {
	this.isOriginal = true;
	this.index = index;
}

Source.prototype = {
	traceSegment ( line, column, name ) {
		return { line, column, name, index: this.index };
	}
};

function Link ( map, sources ) {
	if ( !map ) throw new Error( 'Cannot generate a sourcemap if non-sourcemap-generating transformers are used' );

	this.sources = sources;
	this.names = map.names;
	this.mappings = decode( map.mappings );
}

Link.prototype = { // TODO bring into line with others post-https://github.com/rollup/rollup/pull/386
	traceMappings () {
		let names = [];

		const mappings = this.mappings.map( line => {
			let tracedLine = [];

			line.forEach( segment => {
				const source = this.sources[ segment[1] ];
				const traced = source.traceSegment( segment[2], segment[3], this.names[ segment[4] ] );

				if ( traced ) {
					let nameIndex = null;
					segment = [
						segment[0],
						traced.index,
						traced.line,
						traced.column
					];

					if ( traced.name ) {
						nameIndex = names.indexOf( traced.name );
						if ( nameIndex === -1 ) {
							nameIndex = names.length;
							names.push( traced.name );
						}

						segment[4] = nameIndex;
					}

					tracedLine.push( segment );
				}
			});

			return tracedLine;
		});

		return { names, mappings };
	},

	traceSegment ( line, column, name ) {
		const segments = this.mappings[ line ];

		if ( !segments ) return null;

		for ( let i = 0; i < segments.length; i += 1 ) {
			const segment = segments[i];

			if ( segment[0] > column ) return null;

			if ( segment[0] === column ) {
				const source = this.sources[ segment[1] ];

				if ( !source ) throw new Error( 'Bad sourcemap' );

				return source.traceSegment( segment[2], segment[3], this.names[ segment[4] ] || name );
			}
		}

		return null;
	}
};

export default function collapseSourcemaps ( map, modules, bundleSourcemapChain ) {
	const sources = modules.map( ( module, i ) => {
		let source = new Source( i );

		module.sourceMapChain.forEach( map => {
			source = new Link( map, [ source ]);
		});

		return source;
	});

	let source = new Link( map, sources );

	bundleSourcemapChain.forEach( map => {
		source = new Link( map, [ source ] );
	});

	const { names, mappings } = source.traceMappings();

	// we re-use the `map` object because it has convenient toString/toURL methods
	map.sourcesContent = modules.map( module => module.originalCode );
	map.mappings = encode( mappings );
	map.names = names;

	return map;
}
