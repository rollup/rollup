#!/usr/bin/env node
import process from 'node:process';
import help from 'help.md';
import { version } from 'package.json';
import argParser from 'yargs-parser';
import { commandAliases } from '../src/utils/options/mergeOptions';
import run from './run/index';

const command = argParser(process.argv.slice(2), {
	alias: commandAliases,
	configuration: { 'camel-case-expansion': false }
});

if (command.help || (process.argv.length <= 2 && process.stdin.isTTY)) {
	console.log(`\n${help.replace('__VERSION__', version)}\n`);
} else if (command.version) {
	console.log(`rollup v${version}`);
} else {
	try {
		// eslint-disable-next-line unicorn/prefer-module, @typescript-eslint/no-require-imports
		require('source-map-support').install();
	} catch {
		// do nothing
	}

	const promise = run(command);
	if (command.forceExit) {
		// eslint-disable-next-line unicorn/no-process-exit
		promise.then(() => process.exit());
	}
}
