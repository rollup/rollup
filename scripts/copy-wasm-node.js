import fs from 'node:fs/promises';
import { resolve } from 'node:path';

const NATIVES_DIR_NAME = 'npm';

async function copy() {
	const directories = await fs.readdir(NATIVES_DIR_NAME);
	for (const dir of directories) {
		const target = resolve(NATIVES_DIR_NAME, dir, 'wasm-node');
		fs.cp('artifacts/bindings-wasm-node/wasm-node', target, { recursive: true });
	}
}

copy();
