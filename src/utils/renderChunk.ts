import { decode } from 'sourcemap-codec';
import Chunk from '../Chunk';
import Graph from '../Graph';
import { OutputOptions, Plugin, RawSourceMap, RenderedChunk } from '../rollup/types';
import { error } from './error';

export default function renderChunk({
	graph,
	chunk,
	renderChunk,
	code,
	sourcemapChain,
	options
}: {
	chunk: Chunk;
	code: string;
	graph: Graph;
	options: OutputOptions;
	renderChunk: RenderedChunk;
	sourcemapChain: RawSourceMap[];
}) {
	const renderChunkReducer = (code: string, result: any, plugin: Plugin): string => {
		if (result == null) return code;

		if (typeof result === 'string')
			result = {
				code: result,
				map: undefined
			};

		const map = typeof result.map === 'string' ? JSON.parse(result.map) : result.map;
		if (map && typeof map.mappings === 'string') map.mappings = decode(map.mappings);

		// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
		if (map !== null) sourcemapChain.push(map || { missing: true, plugin: plugin.name });

		return result.code;
	};

	let inTransformBundle = false;
	let inRenderChunk = true;
	return graph.pluginDriver
		.hookReduceArg0('renderChunk', [code, renderChunk, options], renderChunkReducer)
		.then(code => {
			inRenderChunk = false;
			return graph.pluginDriver.hookReduceArg0(
				'transformChunk',
				[code, options, chunk],
				renderChunkReducer
			);
		})
		.then(code => {
			inTransformBundle = true;
			return graph.pluginDriver.hookReduceArg0(
				'transformBundle',
				[code, options, chunk],
				renderChunkReducer
			);
		})
		.catch(err => {
			if (inRenderChunk) throw err;
			error(err, {
				code: inTransformBundle ? 'BAD_BUNDLE_TRANSFORMER' : 'BAD_CHUNK_TRANSFORMER',
				message: `Error transforming ${(inTransformBundle ? 'bundle' : 'chunk') +
					(err.plugin ? ` with '${err.plugin}' plugin` : '')}: ${err.message}`,
				plugin: err.plugin
			});
		});
}
