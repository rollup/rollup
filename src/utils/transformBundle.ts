import { decode } from 'sourcemap-codec';
import error from './error';
import { OutputOptions, Plugin, RawSourceMap } from '../rollup/types';

export default function transformChunk(
	code: string,
	plugins: Plugin[],
	sourcemapChain: RawSourceMap[],
	options: OutputOptions
) {
	return plugins.reduce((promise, plugin) => {
		if (!plugin.transformBundle) return promise;

		return promise.then(code => {
			return Promise.resolve()
				.then(() => (plugin.transformChunk || plugin.transformBundle)(code, options))
				.then(result => {
					if (result == null) return code;

					if (typeof result === 'string' && plugin.transformBundle) {
						result = {
							code: result,
							map: undefined
						};
					} else if (typeof result !== 'string' || typeof result.code !== 'string' || !result.map) {
						throw new Error('transformChunk');
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
				})
				.catch(err => {
					error({
						code: plugin.transformChunk ? 'BAD_CHUNK_TRANSFORMER' : 'BAD_BUNDLE_TRANSFORMER',
						message: `Error transforming bundle${
							plugin.name ? ` with '${plugin.name}' plugin` : ''
						}: ${err.message}`,
						plugin: plugin.name
					});
				});
		});
	}, Promise.resolve(code));
}
