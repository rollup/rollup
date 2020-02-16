const importTransformations = [
	{
		expected: "import 'acorn'",
		replacement: "import 'acorn/dist/acorn.mjs'",
		count: 2
	},
	{
		expected: "import acorn, { Parser } from 'acorn';",
		replacement:
			"import * as acorn from 'acorn/dist/acorn.m js';\nimport { Parser } from 'acorn/dist/acorn.mjs';",
		count: 1
	}
];

// by default, rollup-plugin-commonjs will translate require statements as default imports
// which can cause issues for secondary tools that use the ESM version of acorn
export default function fixAcornEsImport() {
	const foundImports = Object.create(null);
	for (const { expected } of importTransformations) {
		foundImports[expected] = 0;
	}

	return {
		name: 'fix-acorn-es-import',
		renderChunk(code) {
			for (const { expected, replacement } of importTransformations) {
				code = code.replace(expected, () => {
					foundImports[expected]++;
					return replacement;
				});
			}
			return code;
		},
		writeBundle() {
			for (const { expected, count } of importTransformations) {
				if (count !== foundImports[expected]) {
					this.error(
						`Expected to find "${expected}" ${count} times in the code but found it ${foundImports[expected]} times, please examine the generated code.`
					);
				}
			}
		}
	};
}
