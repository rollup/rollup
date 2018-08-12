import * as ESTree from 'estree';
import { decode } from 'sourcemap-codec';
import Program from '../ast/nodes/Program';
import Graph from '../Graph';
import Module from '../Module';
import {
	Asset,
	Plugin,
	RawSourceMap,
	RollupError,
	RollupWarning,
	TransformSourceDescription
} from '../rollup/types';
import { createTransformEmitAsset, EmitAsset } from './assetHooks';
import error, { augmentCodeLocation } from './error';
import { dirname, resolve } from './path';

export default function transform(
	graph: Graph,
	source: TransformSourceDescription,
	module: Module
) {
	const id = module.id;
	const sourcemapChain: RawSourceMap[] = [];

	const originalSourcemap = typeof source.map === 'string' ? JSON.parse(source.map) : source.map;
	if (originalSourcemap && typeof originalSourcemap.mappings === 'string')
		originalSourcemap.mappings = decode(originalSourcemap.mappings);

	const baseEmitAsset = graph.pluginDriver.emitAsset;

	const originalCode = source.code;
	let ast = <Program>source.ast;

	let transformDependencies: string[];

	let assets: Asset[];
	const curSource: string = source.code;

	function transformReducer(code: string, result: any, plugin: Plugin) {
		// assets emitted by transform are transformDependencies
		if (assets.length) module.transformAssets = assets;
		for (const asset of assets) {
			if (asset.dependencies) {
				for (const depId of asset.dependencies) {
					if (!transformDependencies) transformDependencies = [];
					if (transformDependencies.indexOf(depId) === -1) transformDependencies.push(depId);
				}
			}
		}

		if (result == null) return code;

		if (typeof result === 'string') {
			result = {
				code: result,
				ast: undefined,
				map: undefined
			};
		} else if (typeof result.map === 'string') {
			// `result.map` can only be a string if `result` isn't
			result.map = JSON.parse(result.map);
		}

		if (Array.isArray(result.dependencies)) {
			if (!transformDependencies) transformDependencies = [];
			for (const dep of result.dependencies) {
				transformDependencies.push(resolve(dirname(id), dep));
			}
		}

		if (result.map && typeof result.map.mappings === 'string') {
			result.map.mappings = decode(result.map.mappings);
		}

		// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
		if (result.map !== null) {
			sourcemapChain.push(result.map || { missing: true, plugin: plugin.name });
		}

		ast = result.ast;

		return result.code;
	}

	return graph.pluginDriver
		.hookReduceArg0<any, string>(
			'transform',
			[curSource, id],
			transformReducer,
			(pluginContext, plugin) => {
				let emitAsset: EmitAsset;
				({ assets, emitAsset } = createTransformEmitAsset(graph.assetsById, baseEmitAsset));
				return {
					...pluginContext,
					warn(warning: RollupWarning | string, pos?: { line: number; column: number }) {
						if (typeof warning === 'string') warning = { message: warning };
						if (pos) augmentCodeLocation(warning, pos, curSource, id);
						if (warning.code) warning.pluginCode = warning.code;
						warning.id = id;
						warning.code = 'PLUGIN_WARNING';
						warning.plugin = plugin.name || '(anonymous plugin)';
						warning.hook = 'transform';
						graph.warn(warning);
					},
					error(err: RollupError | string, pos?: { line: number; column: number }) {
						if (typeof err === 'string') err = { message: err };
						if (pos) augmentCodeLocation(err, pos, curSource, id);
						if (err.code) err.pluginCode = err.code;
						err.id = id;
						err.code = 'PLUGIN_ERROR';
						err.plugin = plugin.name || '(anonymous plugin)';
						err.hook = 'transform';
						error(err);
					},
					emitAsset,
					setAssetSource: () =>
						error({
							code: 'INVALID_SETASSETSOURCE',
							message: `setAssetSource cannot be called in transform for caching reasons. Use emitAsset with a source, or call setAssetSource in another hook.`
						})
				};
			}
		)
		.catch(err => {
			if (typeof err === 'string') err = { message: err };
			if (err.code !== 'PLUGIN_ERROR') {
				if (err.code) err.pluginCode = err.code;
				err.code = 'PLUGIN_ERROR';
			}
			err.id = id;
			error(err);
		})
		.then(code => ({
			code,
			transformDependencies,
			originalCode,
			originalSourcemap,
			ast: <ESTree.Program>ast,
			sourcemapChain
		}));
}
