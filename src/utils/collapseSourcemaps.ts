import { DecodedSourceMap, SourceMap } from 'magic-string';
import Module from '../Module';
import {
	DecodedSourceMapOrMissing,
	ExistingDecodedSourceMap,
	SourceMapSegment,
	WarningHandler
} from '../rollup/types';
import { error } from './error';
import { basename, dirname, relative, resolve } from './path';

class Source {
	readonly content: string;
	readonly filename: string;
	isOriginal = true;

	constructor(filename: string, content: string) {
		this.filename = filename;
		this.content = content;
	}

	traceSegment(line: number, column: number, name: string): SourceMapSegmentObject {
		return { column, line, name, source: this };
	}
}

interface SourceMapSegmentObject {
	column: number;
	line: number;
	name: string;
	source: Source;
}

class Link {
	readonly mappings: SourceMapSegment[][];
	readonly names: string[];
	readonly sources: (Source | Link)[];

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
		const nameIndexMap = new Map<string, number>();

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
						let nameIndex = nameIndexMap.get(traced.name);
						if (nameIndex === undefined) {
							nameIndex = names.length;
							names.push(traced.name);
							nameIndexMap.set(traced.name, nameIndex);
						}

						(tracedSegment as SourceMapSegment)[4] = nameIndex;
					}

					tracedLine.push(tracedSegment);
				}
			}

			mappings.push(tracedLine);
		}

		return { mappings, names, sources, sourcesContent };
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

function getLinkMap(warn: WarningHandler) {
	return function linkMap(source: Source | Link, map: DecodedSourceMapOrMissing): Link {
		if (map.mappings) {
			return new Link(map, [source]);
		}

		warn({
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
	sourcemapChain: readonly DecodedSourceMapOrMissing[],
	linkMap: (source: Source | Link, map: DecodedSourceMapOrMissing) => Link
): Source | Link {
	let source: Source | Link;

	if (!originalSourcemap) {
		source = new Source(id, originalCode);
	} else {
		const sources = originalSourcemap.sources;
		const sourcesContent = originalSourcemap.sourcesContent || [];
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
	file: string,
	map: DecodedSourceMap,
	modules: readonly Module[],
	bundleSourcemapChain: readonly DecodedSourceMapOrMissing[],
	excludeContent: boolean | undefined,
	warn: WarningHandler
): SourceMap {
	const linkMap = getLinkMap(warn);
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

	return new SourceMap({ file, mappings, names, sources, sourcesContent });
}

export function collapseSourcemap(
	id: string,
	originalCode: string,
	originalSourcemap: ExistingDecodedSourceMap | null,
	sourcemapChain: readonly DecodedSourceMapOrMissing[],
	warn: WarningHandler
): ExistingDecodedSourceMap | null {
	if (!sourcemapChain.length) {
		return originalSourcemap;
	}

	const source = getCollapsedSourcemap(
		id,
		originalCode,
		originalSourcemap,
		sourcemapChain,
		getLinkMap(warn)
	) as Link;
	const map = source.traceMappings();
	return { version: 3, ...map };
}
