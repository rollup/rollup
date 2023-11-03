import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const NATIVE_JS_PATH = path.resolve(__dirname, '../native.js');
const NATIVE_WASM_JS_PATH = path.resolve(__dirname, '../native.wasm.js');

const [nativeJsContent, nativeWasmJsContent] = await Promise.all([
	fs.readFile(NATIVE_JS_PATH, 'utf8'),
	fs.readFile(NATIVE_WASM_JS_PATH, 'utf8')
]);

const nativeJsExportsMatches = nativeJsContent.matchAll(/exports\.(\w+)\s*=/g);
const notFoundExports = [];
for (const match of nativeJsExportsMatches) {
	const exportName = match[1];
	if (!nativeWasmJsContent.includes(`exports.${exportName}`)) {
		notFoundExports.push(exportName);
	}
}

if (notFoundExports.length > 0) {
	throw new Error(
		`${JSON.stringify(
			notFoundExports.join(',')
		)} was exported from native.js but not exported from native.wasm.js.`
	);
}
