#!/usr/bin/env node
import help from 'help.md';
import process from 'node:process';
import argParser from 'yargs-parser';
import package_ from '../package.json' with { type: 'json' };
import { commandAliases } from '../src/utils/options/mergeOptions';
import { flushOutput } from './logging';
import run from './run/index';

const command = argParser(process.argv.slice(2), {
	alias: commandAliases,
	configuration: { 'camel-case-expansion': false }
});

if (command.help || (process.argv.length <= 2 && process.stdin.isTTY)) {
	console.log(`\n${help}\n`);
} else if (command.version) {
	console.log(`rollup v${package_.version}`);
} else {
	const promise = run(command);
	if (command.forceExit) {
		promise.then(async () => {
			await Promise.all([flushOutput(process.stdout), flushOutput(process.stderr)]);
			process.exit();
		});
	}
}
