const assert = require('node:assert');
const { encode } = require('@jridgewell/sourcemap-codec');
const terser = require('terser');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

const originalCode = `
export function App() {
  return <div>{'.'}</div>;
}
`;

module.exports = defineTest({
	description: 'get correct combined sourcemap in transforming',
	formats: ['es'],
	options: {
		external: ['react/jsx-runtime'],
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
					return {
						code: `import { jsx } from "react/jsx-runtime";
export function App() {
  return /* @__PURE__ */ jsx("div", { children: "." });
}
`,
						map: {
							mappings: encode([
								[[0, 0, 2, 9]],
								[
									[0, 0, 1, 7],
									[16, 0, 1, 16],
									[22, 0, 1, 22]
								],
								[
									// coarse segment
									[0, 0, 2, 2],
									[9, 0, 2, 9],
									[29, 0, 2, 10],
									[38, 0, 2, 15],
									[53, 0, 2, 19]
								],
								[[0, 0, 3, 0]],
								[]
							]),
							sourcesContent: [code]
						}
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
