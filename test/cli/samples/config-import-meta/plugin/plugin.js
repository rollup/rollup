import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import assert from 'assert';

const __dirname = dirname(fileURLToPath(import.meta.url));
const id = 'test';
const fileName = `test.txt`;

function validateImportMeta(importMeta) {
	assert.strictEqual(importMeta.url, import.meta.url);
	assert.strictEqual(importMeta.filename, import.meta.filename);
	assert.strictEqual(importMeta.dirname, import.meta.dirname);
}

validateImportMeta(import.meta);
assert.strictEqual(import.meta.foo, undefined);

export default () => ({
	resolveId(source) {
		if (source === id) {
			return source;
		}
	},
	load(loadedId) {
		if (loadedId === id) {
			return `export default '${readFileSync(resolve(__dirname, fileName), 'utf8')}';`;
		}
	}
});
