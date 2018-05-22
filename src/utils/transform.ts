import * as ESTree from 'estree';
import { decode } from 'sourcemap-codec';
import { locate } from 'locate-character';
import error from './error';
import getCodeFrame from './getCodeFrame';
import Graph from '../Graph';
import {
	Plugin,
	RollupWarning,
	RollupError,
	SourceDescription,
	PluginContext,
	RawSourceMap
} from '../rollup/types';
import Program from '../ast/nodes/Program';

function augmentCodeLocation<T extends RollupError | RollupWarning>({
	object,
	pos,
	code,
	id,
	source,
	pluginName
}: {
	object: T;
	pos: { line: number; column: number };
	code: string;
	id: string;
	source: string;
	pluginName: string;
}): T {
	if (object.code) object.pluginCode = object.code;
	object.code = code;

	if (pos !== undefined) {
		if (pos.line !== undefined && pos.column !== undefined) {
			const { line, column } = pos;
			object.loc = { file: id, line, column };
			object.frame = getCodeFrame(source, line, column);
		} else {
			object.pos = <any>pos;
			const { line, column } = locate(source, pos, { offsetLine: 1 });
			object.loc = { file: id, line, column };
			object.frame = getCodeFrame(source, line, column);
		}
	}

	object.plugin = pluginName;
	object.id = id;

	return object;
}

function createPluginTransformContext(
	graph: Graph,
	plugin: Plugin,
	id: string,
	source: string
): PluginContext {
	return {
		isExternal: graph.pluginContext.isExternal,
		resolveId: graph.pluginContext.resolveId,
		parse: graph.pluginContext.parse,
		emitAsset: graph.pluginContext.emitAsset,
		setAssetSource: graph.pluginContext.setAssetSource,
		warn(warning: RollupWarning | string, pos?: { line: number; column: number }) {
			if (typeof warning === 'string') warning = { message: warning };
			warning = augmentCodeLocation({
				object: warning,
				pos,
				code: 'PLUGIN_WARNING',
				id,
				source,
				pluginName: plugin.name
			});
			graph.warn(warning);
		},
		error(err: RollupError | string, pos?: { line: number; column: number }) {
			if (typeof err === 'string') err = { message: err };
			err = augmentCodeLocation({
				object: err,
				pos,
				code: 'PLUGIN_ERROR',
				id,
				source,
				pluginName: plugin.name
			});
			error(err);
		}
	};
}

export default function transform(
	graph: Graph,
	source: SourceDescription,
	id: string,
	plugins: Plugin[]
) {
	const sourcemapChain: RawSourceMap[] = [];

	const originalSourcemap = typeof source.map === 'string' ? JSON.parse(source.map) : source.map;

	if (originalSourcemap && typeof originalSourcemap.mappings === 'string') {
		originalSourcemap.mappings = decode(originalSourcemap.mappings);
	}

	const originalCode = source.code;
	let ast = <Program>source.ast;

	let promise = Promise.resolve(source.code);

	plugins.forEach(plugin => {
		if (!plugin.transform) return;

		promise = promise.then(previous => {
			return Promise.resolve()
				.then(() => {
					const context = createPluginTransformContext(graph, plugin, id, previous);
					return plugin.transform.call(context, previous, id);
				})
				.then(result => {
					if (result == null) return previous;

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

					if (result.map && typeof result.map.mappings === 'string') {
						result.map.mappings = decode(result.map.mappings);
					}

					// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
					if (result.map !== null) {
						sourcemapChain.push(result.map || { missing: true, plugin: plugin.name });
					}

					ast = result.ast;

					return result.code;
				})
				.catch(err => {
					if (typeof err === 'string') err = { message: err };
					if (err.code !== 'PLUGIN_ERROR') {
						if (err.code) err.pluginCode = err.code;
						err.code = 'PLUGIN_ERROR';
					}
					err.plugin = plugin.name;
					err.id = id;
					error(err);
				});
		});
	});

	return promise.then(code => {
		return {
			code,
			originalCode,
			originalSourcemap,
			ast: <ESTree.Program>ast,
			sourcemapChain
		};
	});
}
