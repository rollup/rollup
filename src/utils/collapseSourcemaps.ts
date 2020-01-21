import { DecodedSourceMap, SourceMap } from 'magic-string';
import Chunk from '../Chunk';
import Graph from '../Graph';
import Module from '../Module';
import {
	DecodedSourceMapOrMissing,
	ExistingDecodedSourceMap,
	SourceMapSegment
} from '../rollup/types';
import { error } from './error';
import { basename, dirname, relative, resolve } from './path';

class Source {
	content: string;
	filename: string;
	isOriginal: boolean;

	constructor(filename: string, content: string) {
		this.isOriginal = true;
		this.filename = filename;
		this.content = content;
	}

	traceSegment(line: number, column: number, name: string): SourceMapSegmentObject {
		return { line, column, name, source: this };
	}
}

interface SourceMapSegmentObject {
	column: number;
	line: number;
	name: string;
	source: Source;
}

class Link {
	mappings: SourceMapSegment[][];
	names: string[];
	sources: (Source | Link)[];

	constructor(
		map: { mappings: SourceMapSegment[][]; names: string[] },
		sources: (Source | Link)[]
	) {
		this.sources = sources;
		this.names = map.names;
		this.mappings = map.mappings;
	}

	traceMappings() {
		const sources: string[] = [];
		const sourcesContent: string[] = [];
		const names: string[] = [];

		const mappings = [];

		for (const line of this.mappings) {
			const tracedLine: SourceMapSegment[] = [];

			for (const segment of line) {
				if (segment.length == 1) continue;
				const source = this.sources[segment[1]];
				if (!source) continue;

				const traced = source.traceSegment(
					segment[2],
					segment[3],
					segment.length === 5 ? this.names[segment[4]] : ''
				);

				if (traced) {
					// newer sources are more likely to be used, so search backwards.
					let sourceIndex = sources.lastIndexOf(traced.source.filename);
					if (sourceIndex === -1) {
						sourceIndex = sources.length;
						sources.push(traced.source.filename);
						sourcesContent[sourceIndex] = traced.source.content;
					} else if (sourcesContent[sourceIndex] == null) {
						sourcesContent[sourceIndex] = traced.source.content;
					} else if (
						traced.source.content != null &&
						sourcesContent[sourceIndex] !== traced.source.content
					) {
						return error({
							message: `Multiple conflicting contents for sourcemap source ${traced.source.filename}`
						});
					}

					const tracedSegment: SourceMapSegment = [
						segment[0],
						sourceIndex,
						traced.line,
						traced.column
					];

					if (traced.name) {
						let nameIndex = names.indexOf(traced.name);
						if (nameIndex === -1) {
							nameIndex = names.length;
							names.push(traced.name);
						}

						(tracedSegment as SourceMapSegment)[4] = nameIndex;
					}

					tracedLine.push(tracedSegment);
				}
			}

			mappings.push(tracedLine);
		}

		return { sources, sourcesContent, names, mappings };
	}

	traceSegment(line: number, column: number, name: string): SourceMapSegmentObject | null {
		const segments = this.mappings[line];
		if (!segments) return null;

		// binary search through segments for the given column
		let i = 0;
		let j = segments.length - 1;

		while (i <= j) {
			const m = (i + j) >> 1;
			const segment = segments[m];
			if (segment[0] === column) {
				if (segment.length == 1) return null;
				const source = this.sources[segment[1]];
				if (!source) return null;

				return source.traceSegment(
					segment[2],
					segment[3],
					segment.length === 5 ? this.names[segment[4]] : name
				);
			}
			if (segment[0] > column) {
				j = m - 1;
			} else {
				i = m + 1;
			}
		}

		return null;
	}
}

function getLinkMap(graph: Graph) {
	return function linkMap(source: Source | Link, map: DecodedSourceMapOrMissing) {
		if (map.mappings) {
			return new Link(map, [source]);
		}

		graph.warn({
			code: 'SOURCEMAP_BROKEN',
			message:
				`Sourcemap is likely to be incorrect: a plugin (${map.plugin}) was used to transform ` +
				"files, but didn't generate a sourcemap for the transformation. Consult the plugin " +
				'documentation for help',
			plugin: map.plugin,
			url: `https://rollupjs.org/guide/en/#warning-sourcemap-is-likely-to-be-incorrect`
		});

		return new Link(
			{
				mappings: [],
				names: []
			},
			[source]
		);
	};
}

function getCollapsedSourcemap(
	id: string,
	originalCode: string,
	originalSourcemap: ExistingDecodedSourceMap | null,
	sourcemapChain: DecodedSourceMapOrMissing[],
	linkMap: (source: Source | Link, map: DecodedSourceMapOrMissing) => Link
): Source | Link {
	let source: Source | Link;

	if (!originalSourcemap) {
		source = new Source(id, originalCode);
	} else {
		const sources = originalSourcemap.sources;
		const sourcesContent = originalSourcemap.sourcesContent || [];

		// TODO indiscriminately treating IDs and sources as normal paths is probably bad.
		const directory = dirname(id) || '.';
		const sourceRoot = originalSourcemap.sourceRoot || '.';

		const baseSources = sources.map(
			(source, i) => new Source(resolve(directory, sourceRoot, source), sourcesContent[i])
		);
		source = new Link(originalSourcemap, baseSources);
	}
	return sourcemapChain.reduce(linkMap, source);
}

export function collapseSourcemaps(
	bundle: Chunk,
	file: string,
	map: DecodedSourceMap,
	modules: Module[],
	bundleSourcemapChain: DecodedSourceMapOrMissing[],
	excludeContent: boolean | undefined
) {
	const linkMap = getLinkMap(bundle.graph);
	const moduleSources = modules
		.filter(module => !module.excludeFromSourcemap)
		.map(module =>
			getCollapsedSourcemap(
				module.id,
				module.originalCode,
				module.originalSourcemap,
				module.sourcemapChain,
				linkMap
			)
		);

	// DecodedSourceMap (from magic-string) uses a number[] instead of the more
	// correct SourceMapSegment tuples. Cast it here to gain type safety.
	let source = new Link(map as ExistingDecodedSourceMap, moduleSources);

	source = bundleSourcemapChain.reduce(linkMap, source);

	let { sources, sourcesContent, names, mappings } = source.traceMappings();

	if (file) {
		const directory = dirname(file);
		sources = sources.map((source: string) => relative(directory, source));
		file = basename(file);
	}

	sourcesContent = (excludeContent ? null : sourcesContent) as string[];

	return new SourceMap({ file, sources, sourcesContent, names, mappings });
}

export function collapseSourcemap(
	graph: Graph,
	id: string,
	originalCode: string,
	originalSourcemap: ExistingDecodedSourceMap | null,
	sourcemapChain: DecodedSourceMapOrMissing[]
): ExistingDecodedSourceMap | null {
	if (!sourcemapChain.length) {
		return originalSourcemap;
	}

	const source = getCollapsedSourcemap(
		id,
		originalCode,
		originalSourcemap,
		sourcemapChain,
		getLinkMap(graph)
	) as Link;
	const map = source.traceMappings();
	return { version: 3, ...map };
}
