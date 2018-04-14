import * as ESTree from 'estree';
import { Options as AcornOptions } from 'acorn';
import { decode } from 'sourcemap-codec';
import { locate } from 'locate-character';
import error from './error';
import getCodeFrame from './getCodeFrame';
import Graph from '../Graph';
import { defaultAcornOptions } from '../Module';
import {
	Plugin,
	RollupWarning,
	RollupError,
	SourceDescription,
	PluginContext,
	RawSourceMap
} from '../rollup/types';
import Program from '../ast/nodes/Program';

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
			function augment<T extends RollupError | RollupWarning>(
				object: T | string,
				pos: { line: number; column: number },
				code: string
			): T {
				const outObject = typeof object === 'string' ? <T>{ message: object } : object;

				if (outObject.code) outObject.pluginCode = outObject.code;
				outObject.code = code;

				if (pos !== undefined) {
					if (pos.line !== undefined && pos.column !== undefined) {
						const { line, column } = pos;
						outObject.loc = { file: id, line, column };
						outObject.frame = getCodeFrame(previous, line, column);
					} else {
						outObject.pos = <any>pos;
						const { line, column } = locate(previous, pos, { offsetLine: 1 });
						outObject.loc = { file: id, line, column };
						outObject.frame = getCodeFrame(previous, line, column);
					}
				}

				outObject.plugin = plugin.name;
				outObject.id = id;

				return outObject;
			}

			let throwing;

			const context: PluginContext = {
				parse(code: string, options: AcornOptions = {}) {
					return graph.acornParse(
						code,
						Object.assign({}, defaultAcornOptions, options, graph.acornOptions)
					);
				},

				warn(warning: RollupWarning, pos?: { line: number; column: number }) {
					warning = augment(warning, pos, 'PLUGIN_WARNING');
					graph.warn(warning);
				},

				error(err: RollupError, pos?: { line: number; column: number }) {
					err = augment(err, pos, 'PLUGIN_ERROR');
					throwing = true;
					error(err);
				}
			};

			let transformed;

			try {
				transformed = plugin.transform.call(context, previous, id);
			} catch (err) {
				if (!throwing) context.error(err);
				error(err);
			}

			return Promise.resolve(transformed)
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
					err = augment(err, undefined, 'PLUGIN_ERROR');
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
