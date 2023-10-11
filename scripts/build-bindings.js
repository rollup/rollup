#!/usr/bin/env node

import { exec } from 'node:child_process';
import { env, exit } from 'node:process';
import argsParser from 'yargs-parser';

const parsedArguments = argsParser(process.argv.slice(2));
const binding = parsedArguments.binding;
const target = parsedArguments.target;

const isRelease = env.ROLLUP_RELEASE === 'releasing' || env.BUILD_ARTEFACTS === 'build';

const buildCommands = {
	napi: {
		dev: 'napi build --platform --dts native.d.ts --js false --cargo-cwd rust -p bindings_napi --cargo-name bindings_napi',
		release:
			'napi build --platform --dts native.d.ts --js false --cargo-cwd rust -p bindings_napi --cargo-name bindings_napi --release'
	},
	wasm: {
		dev: 'wasm-pack build rust/bindings_wasm --dev --out-dir ../../wasm --target web --no-pack',
		postBuild: 'shx rm wasm/.gitignore',
		release: 'wasm-pack build rust/bindings_wasm --out-dir ../../wasm --target web --no-pack'
	},
	'wasm-node': {
		dev: 'wasm-pack build rust/bindings_wasm --dev --out-dir ../../wasm-node --target nodejs --no-pack',
		postBuild: 'shx rm wasm-node/.gitignore',
		release:
			'wasm-pack build rust/bindings_wasm --out-dir ../../wasm-node --target nodejs --no-pack'
	}
};

const commandToRun = (() => {
	const buildCommand = buildCommands[binding][isRelease ? 'release' : 'dev'];
	const commandWithTarget = target ? `${buildCommand} --target ${target}` : buildCommand;
	const postBuild = buildCommands[binding].postBuild;
	return postBuild ? `${commandWithTarget} && ${postBuild}` : commandWithTarget;
})();

console.log(`
command to run: ${commandToRun}
release or dev: ${isRelease ? 'release' : 'dev'}
binding: ${binding}
target: ${target}
`);

exec(commandToRun, (error, stdout, stderr) => {
	if (error) {
		console.error(error);
		exit(1);
	}

	console.log(stdout);
	console.error(stderr);
});
