const assert = require('node:assert');
const esbuild = require('esbuild');
const { decode, encode } = require('@jridgewell/sourcemap-codec');
const terser = require('terser');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

const originalCode = `
import { useEffect } from 'react';

export function App() {
  useEffect(() => {
    console.log('ReplayAnalyze');
  }, []);

  return <div>{'.'}</div>;
}
`;

module.exports = defineTest({
	description: 'get correct combined sourcemap in transforming',
	formats: ['es'],
	options: {
		external: ['react/jsx-runtime', 'react'],
		plugins: [
			{
				resolveId(id) {
					return id;
				},
				load() {
					return {
						code: originalCode
					};
				}
			},
			{
				async transform(code) {
					const { code: transformedCode, map } = await esbuild.transform(code, {
						loader: 'tsx',
						jsx: 'automatic',
						sourcemap: true
					});
					const sourcemap = JSON.parse(map);
					const decodedMap = decode(sourcemap.mappings);
					// Maybe esbuild will generate more precise sourcemap segment [2, 0, 8, 2] instead of [0, 0, 8, 2] in the future.
					// For testing the current fix always work, we need to keep this segment is a coarse segment [0, 0, 8, 2].
					decodedMap[6][0] = [0, 0, 8, 2];
					return {
						code: transformedCode,
						map: JSON.stringify({
							...sourcemap,
							mappings: encode(decodedMap)
						})
					};
				}
			},
			{
				transform(code) {
					return terser.minify(code, {
						sourceMap: true
					});
				}
			},
			{
				async transform(code) {
					const generatedLoc = getLocation(code, code.indexOf('return'));
					const map = this.getCombinedSourcemap();
					const smc = await new SourceMapConsumer(map);
					const originalLoc = smc.originalPositionFor(generatedLoc);
					const expectedOriginalLoc = getLocation(originalCode, originalCode.indexOf('return'));
					assert.equal(originalLoc.line, expectedOriginalLoc.line);
					assert.equal(originalLoc.column, expectedOriginalLoc.column);
				}
			}
		]
	},
	async test() {}
});
