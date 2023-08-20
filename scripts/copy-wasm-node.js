import fs from 'node:fs/promises';
import { resolve } from 'node:path';

const WASM_NODE_DIR_NAME = 'artifacts/bindings-wasm-node/wasm-node';
const NATIVES_DIR_NAME = 'npm';

async function copy() {
	const directories = await fs.readdir(NATIVES_DIR_NAME);
	for (const dir of directories) {
		const target = resolve(NATIVES_DIR_NAME, dir, WASM_NODE_DIR_NAME);
		fs.cp(WASM_NODE_DIR_NAME, target, { recursive: true });
	}
}

copy();
