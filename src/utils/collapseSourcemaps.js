import { encode } from 'sourcemap-codec';
import error from './error.js';
import { basename, dirname, relative, resolve } from './path.js';

class Source {
	constructor ( filename, content ) {
		this.isOriginal = true;
		this.filename = filename;
		this.content = content;
	}

	traceSegment ( line, column, name ) {
		return { line, column, name, source: this };
	}
}

class Link {
	constructor ( map, sources ) {
		this.sources = sources;
		this.names = map.names;
		this.mappings = map.mappings;
	}

	traceMappings () {
		const sources = [];
		const sourcesContent = [];
		const names = [];

		const mappings = this.mappings.map( line => {
			const tracedLine = [];

			line.forEach( segment => {
				const source = this.sources[ segment[1] ];

				if ( !source ) return;

				const traced = source.traceSegment( segment[2], segment[3], this.names[ segment[4] ] );

				if ( traced ) {
					let sourceIndex = null;
					let nameIndex = null;
					segment = [
						segment[0],
						null,
						traced.line,
						traced.column
					];

					// newer sources are more likely to be used, so search backwards.
					sourceIndex = sources.lastIndexOf( traced.source.filename );
					if ( sourceIndex === -1 ) {
						sourceIndex = sources.length;
						sources.push( traced.source.filename );
						sourcesContent[ sourceIndex ] = traced.source.content;
					} else if ( sourcesContent[ sourceIndex ] == null ) {
						sourcesContent[ sourceIndex ] = traced.source.content;
					} else if ( traced.source.content != null && sourcesContent[ sourceIndex ] !== traced.source.content ) {
						error({
							message: `Multiple conflicting contents for sourcemap source ${source.filename}`
						});
					}

					segment[1] = sourceIndex;

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

		return { sources, sourcesContent, names, mappings };
	}

	traceSegment ( line, column, name ) {
		const segments = this.mappings[ line ];

		if ( !segments ) return null;

		for ( let i = 0; i < segments.length; i += 1 ) {
			const segment = segments[i];

			if ( segment[0] > column ) return null;

			if ( segment[0] === column ) {
				const source = this.sources[ segment[1] ];
				if ( !source ) return null;

				return source.traceSegment( segment[2], segment[3], this.names[ segment[4] ] || name );
			}
		}

		return null;
	}
}

export default function collapseSourcemaps ( bundle, file, map, modules, bundleSourcemapChain ) {
	const moduleSources = modules.filter( module => !module.excludeFromSourcemap ).map( module => {
		let sourcemapChain = module.sourcemapChain;

		let source;
		if ( module.originalSourcemap == null ) {
			source = new Source( module.id, module.originalCode );
		} else {
			const sources = module.originalSourcemap.sources;
			const sourcesContent = module.originalSourcemap.sourcesContent || [];

			if ( sources == null || ( sources.length <= 1 && sources[0] == null ) ) {
				source = new Source( module.id, sourcesContent[0] );
				sourcemapChain = [ module.originalSourcemap ].concat( sourcemapChain );
			} else {
				// TODO indiscriminately treating IDs and sources as normal paths is probably bad.
				const directory = dirname( module.id ) || '.';
				const sourceRoot = module.originalSourcemap.sourceRoot || '.';

				const baseSources = sources.map( (source, i) => {
					return new Source( resolve( directory, sourceRoot, source ), sourcesContent[i] );
				});

				source = new Link( module.originalSourcemap, baseSources );
			}
		}

		sourcemapChain.forEach( map => {
			if ( map.missing ) {
				bundle.warn({
					code: 'SOURCEMAP_BROKEN',
					plugin: map.plugin,
					message: `Sourcemap is likely to be incorrect: a plugin${map.plugin ? ` ('${map.plugin}')` : ``} was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help`,
					url: `https://github.com/rollup/rollup/wiki/Troubleshooting#sourcemap-is-likely-to-be-incorrect`
				});

				map = {
					names: [],
					mappings: ''
				};
			}

			source = new Link( map, [ source ]);
		});

		return source;
	});

	let source = new Link( map, moduleSources );

	bundleSourcemapChain.forEach( map => {
		source = new Link( map, [ source ] );
	});

	let { sources, sourcesContent, names, mappings } = source.traceMappings();

	if ( file ) {
		const directory = dirname( file );
		sources = sources.map( source => relative( directory, source ) );

		map.file = basename( file );
	}

	// we re-use the `map` object because it has convenient toString/toURL methods
	map.sources = sources;
	map.sourcesContent = sourcesContent;
	map.names = names;
	map.mappings = encode( mappings );

	return map;
}
