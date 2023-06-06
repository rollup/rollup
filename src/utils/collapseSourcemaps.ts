import { type DecodedSourceMap, SourceMap } from 'magic-string';
import type Module from '../Module';
import type {
	DecodedSourceMapOrMissing,
	ExistingDecodedSourceMap,
	LogHandler,
	SourceMapSegment
} from '../rollup/types';
import { LOGLEVEL_WARN } from './logging';
import { error, logConflictingSourcemapSources, logSourcemapBroken } from './logs';
import { basename, dirname, relative, resolve } from './path';

class Source {
	readonly content: string | null;
	readonly filename: string;
	isOriginal = true;

	constructor(filename: string, content: string | null) {
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
	readonly mappings: readonly SourceMapSegment[][];
	readonly names: readonly string[];
	readonly sources: (Source | Link)[];

	constructor(
		map: { mappings: readonly SourceMapSegment[][]; names: readonly string[] },
		sources: (Source | Link)[]
	) {
		this.sources = sources;
		this.names = map.names;
		this.mappings = map.mappings;
	}

	traceMappings() {
		const sources: string[] = [];
		const sourceIndexMap = new Map<string, number>();
		const sourcesContent: (string | null)[] = [];
		const names: string[] = [];
		const nameIndexMap = new Map<string, number>();

		const mappings = [];

		for (const line of this.mappings) {
			const tracedLine: SourceMapSegment[] = [];

			for (const segment of line) {
				if (segment.length === 1) continue;
				const source = this.sources[segment[1]];
				if (!source) continue;

				const traced = source.traceSegment(
					segment[2],
					segment[3],
					segment.length === 5 ? this.names[segment[4]] : ''
				);

				if (traced) {
					const {
						column,
						line,
						name,
						source: { content, filename }
					} = traced;
					let sourceIndex = sourceIndexMap.get(filename);
					if (sourceIndex === undefined) {
						sourceIndex = sources.length;
						sources.push(filename);
						sourceIndexMap.set(filename, sourceIndex);
						sourcesContent[sourceIndex] = content;
					} else if (sourcesContent[sourceIndex] == null) {
						sourcesContent[sourceIndex] = content;
					} else if (content != null && sourcesContent[sourceIndex] !== content) {
						return error(logConflictingSourcemapSources(filename));
					}

					const tracedSegment: SourceMapSegment = [segment[0], sourceIndex, line, column];

					if (name) {
						let nameIndex = nameIndexMap.get(name);
						if (nameIndex === undefined) {
							nameIndex = names.length;
							names.push(name);
							nameIndexMap.set(name, nameIndex);
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
		let searchStart = 0;
		let searchEnd = segments.length - 1;

		while (searchStart <= searchEnd) {
			const m = (searchStart + searchEnd) >> 1;
			const segment = segments[m];

			// If a sourcemap does not have sufficient resolution to contain a
			// necessary mapping, e.g. because it only contains line information, we
			// use the best approximation we could find
			if (segment[0] === column || searchStart === searchEnd) {
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
				searchEnd = m - 1;
			} else {
				searchStart = m + 1;
			}
		}

		return null;
	}
}

function getLinkMap(log: LogHandler) {
	return function linkMap(source: Source | Link, map: DecodedSourceMapOrMissing): Link {
		if (map.mappings) {
			return new Link(map, [source]);
		}

		log(LOGLEVEL_WARN, logSourcemapBroken(map.plugin));

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

	if (originalSourcemap) {
		const sources = originalSourcemap.sources;
		const sourcesContent = originalSourcemap.sourcesContent || [];
		const directory = dirname(id) || '.';
		const sourceRoot = originalSourcemap.sourceRoot || '.';

		const baseSources = sources.map(
			(source, index) => new Source(resolve(directory, sourceRoot, source), sourcesContent[index])
		);
		source = new Link(originalSourcemap, baseSources);
	} else {
		source = new Source(id, originalCode);
	}
	return sourcemapChain.reduce(linkMap, source);
}

export function collapseSourcemaps(
	file: string,
	map: DecodedSourceMap,
	modules: readonly Module[],
	bundleSourcemapChain: readonly DecodedSourceMapOrMissing[],
	excludeContent: boolean | undefined,
	log: LogHandler
): SourceMap {
	const linkMap = getLinkMap(log);
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

	const link = new Link(map, moduleSources);
	const source = bundleSourcemapChain.reduce(linkMap, link);
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
	log: LogHandler
): ExistingDecodedSourceMap | null {
	if (sourcemapChain.length === 0) {
		return originalSourcemap;
	}

	const source = getCollapsedSourcemap(
		id,
		originalCode,
		originalSourcemap,
		sourcemapChain,
		getLinkMap(log)
	) as Link;
	const map = source.traceMappings();
	return { version: 3, ...map };
}
