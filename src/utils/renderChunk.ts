import Chunk from '../Chunk';
import {
	DecodedSourceMapOrMissing,
	OutputOptions,
	Plugin,
	RenderedChunk,
	SourceMapInput
} from '../rollup/types';
import { decodedSourcemap } from './decodedSourcemap';
import { error } from './error';
import { PluginDriver } from './PluginDriver';

export default function renderChunk({
	chunk,
	code,
	options,
	outputPluginDriver,
	renderChunk,
	sourcemapChain
}: {
	chunk: Chunk;
	code: string;
	options: OutputOptions;
	outputPluginDriver: PluginDriver;
	renderChunk: RenderedChunk;
	sourcemapChain: DecodedSourceMapOrMissing[];
}): Promise<string> {
	const renderChunkReducer = (
		code: string,
		result: { code: string; map?: SourceMapInput },
		plugin: Plugin
	): string => {
		if (result == null) return code;

		if (typeof result === 'string')
			result = {
				code: result,
				map: undefined
			};

		// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
		if (result.map !== null) {
			const map = decodedSourcemap(result.map);
			sourcemapChain.push(map || { missing: true, plugin: plugin.name });
		}

		return result.code;
	};

	let inTransformBundle = false;
	let inRenderChunk = true;
	return outputPluginDriver
		.hookReduceArg0('renderChunk', [code, renderChunk, options], renderChunkReducer)
		.then(code => {
			inRenderChunk = false;
			return outputPluginDriver.hookReduceArg0(
				'transformChunk',
				[code, options, chunk],
				renderChunkReducer
			);
		})
		.then(code => {
			inTransformBundle = true;
			return outputPluginDriver.hookReduceArg0(
				'transformBundle',
				[code, options, chunk],
				renderChunkReducer
			);
		})
		.catch(err => {
			if (inRenderChunk) throw err;
			return error(err, {
				code: inTransformBundle ? 'BAD_BUNDLE_TRANSFORMER' : 'BAD_CHUNK_TRANSFORMER',
				message: `Error transforming ${(inTransformBundle ? 'bundle' : 'chunk') +
					(err.plugin ? ` with '${err.plugin}' plugin` : '')}: ${err.message}`,
				plugin: err.plugin
			});
		});
}
