import { decode } from 'sourcemap-codec';
import Chunk from '../Chunk';
import Graph from '../Graph';
import { OutputOptions, RawSourceMap } from '../rollup/types';
import { createAssetPluginHooks } from './assetHooks';
import error from './error';

export default function transformChunk(
	graph: Graph,
	chunk: Chunk,
	code: string,
	sourcemapChain: RawSourceMap[],
	options: OutputOptions
) {
	const transformChunkAssetPluginHooks = createAssetPluginHooks(graph.assetsById);

	const transformChunkReducer = (code: string, result: any, plugin: Plugin): string => {
		if (result == null) return code;

		if (typeof result === 'string') {
			result = {
				code: result,
				map: undefined
			};
		} else if (!inTransformBundle && !result.map && options.sourcemap) {
			throw new Error(
				`${
					inTransformBundle ? 'transformBundle' : 'transformChunk'
				} must return a "map" sourcemap property when sourcemaps are enabled.`
			);
		}

		const map = typeof result.map === 'string' ? JSON.parse(result.map) : result.map;
		if (map && typeof map.mappings === 'string') {
			map.mappings = decode(map.mappings);
		}

		// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
		if (map !== null) {
			sourcemapChain.push(map || { missing: true, plugin: plugin.name });
		}

		return result.code;
	};

	let inTransformBundle = false;
	return graph.pluginDriver
		.hookReduceArg0(
			'transformChunk',
			[code, options, chunk],
			transformChunkReducer,
			pluginContext => ({
				...pluginContext,
				...transformChunkAssetPluginHooks
			})
		)
		.then(code => {
			inTransformBundle = true;
			return graph.pluginDriver.hookReduceArg0(
				'transformBundle',
				[code, options, chunk],
				transformChunkReducer,
				pluginContext => ({
					...pluginContext,
					...transformChunkAssetPluginHooks
				})
			);
		})
		.catch(err => {
			error(err, {
				code: inTransformBundle ? 'BAD_BUNDLE_TRANSFORMER' : 'BAD_CHUNK_TRANSFORMER',
				message: `Error transforming ${(inTransformBundle ? 'bundle' : 'chunk') +
					(err.plugin ? ` with '${err.plugin}' plugin` : '')}: ${err.message}`,
				plugin: err.plugin
			});
		});
}
