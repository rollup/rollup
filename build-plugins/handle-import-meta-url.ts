import type { Plugin } from 'rollup';

const HELPER_CODE = `
const __currentScript = typeof document === 'undefined' ? null : document.currentScript;
export default __currentScript;
`;
const HELPER_ID = `'\0importMetaUrlHelper.js'`;

export default function handleImportMetaUrl(): Plugin {
	const moduleIds = /bindings_wasm.js$/;
	return {
		load(id) {
			if (id === HELPER_ID) {
				return HELPER_CODE;
			}
		},
		name: 'handle-import-meta-url',
		async resolveId(id, _importer) {
			if (id === HELPER_ID) {
				return {
					id,
					moduleSideEffects: 'no-treeshake'
				};
			}
		},
		resolveImportMeta(_, { format, moduleId }) {
			if (format === 'umd' && moduleIds.test(moduleId)) {
				return `(typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (__currentScript && __currentScript.src || new URL('rollup.browser.js', document.baseURI).href))`;
			}
		},
		transform(code, id) {
			if (moduleIds.test(id)) {
				return {
					code: `import __currentScript from ${JSON.stringify(HELPER_ID)};${code}`,
					map: null
				};
			}
		}
	};
}
