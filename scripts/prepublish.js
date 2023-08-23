#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readJson, runWithEcho } from './helpers.js';
import publishWasmNodePackage from './publish-wasm-node-package.js';
import { MAIN_PACKAGE } from './release-constants.js';

await runWithEcho('npm', ['run', 'prepublish:napi']);
await publishWasmNodePackage();
await runWithEcho('npm', ['publish', '--tag', 'beta'], { cwd: resolve('browser') });

const { optionalDependencies } = await readJson(MAIN_PACKAGE);
const mainPackage = await readJson(MAIN_PACKAGE);
await writeFile(
	MAIN_PACKAGE,
	JSON.stringify(
		{
			...mainPackage,
			optionalDependencies: { ...optionalDependencies, ...mainPackage.optionalDependencies }
		},
		null,
		2
	)
);
