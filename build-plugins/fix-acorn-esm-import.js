const expectedAcornImport = "import acorn, { Parser } from 'acorn';";
const newAcornImport = "import * as acorn from 'acorn';\nimport { Parser } from 'acorn';";

// by default, rollup-plugin-commonjs will translate require statements as default imports
// which can cause issues for secondary tools that use the ESM version of acorn
export default function fixAcornEsmImport() {
	let found = false;

	return {
		name: 'fix-acorn-esm-import',
		renderChunk(code) {
			return code.replace(expectedAcornImport, () => {
				found = true;
				return newAcornImport;
			});
		},
		writeBundle() {
			if (!found) {
				this.error('Could not find expected acorn import, please examine generated code.');
			}
		}
	};
}
