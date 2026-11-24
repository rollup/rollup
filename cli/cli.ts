#!/usr/bin/env node
import help from 'help.md';
import process from 'node:process';
import argParser from 'yargs-parser';
import package_ from '../package.json' with { type: 'json' };
import { commandAliases, commandValueOptions } from '../src/utils/options/mergeOptions';
import run from './run/index';

const command = argParser(glueDashValues(process.argv.slice(2)), {
	alias: commandAliases,
	configuration: { 'camel-case-expansion': false }
});

// yargs-parser never consumes a bare "-" as an option value, which breaks
// e.g. "--input -". Rewriting it to the "--option=-" form fixes that while
// leaving all other arguments untouched.
function glueDashValues(rawArguments: string[]): string[] {
	const result: string[] = [];
	let sawOptionSeparator = false;
	for (let index = 0; index < rawArguments.length; index++) {
		const argument = rawArguments[index];
		if (sawOptionSeparator || argument === '--') {
			sawOptionSeparator = true;
			result.push(argument);
		} else if (
			argument.startsWith('--') &&
			!argument.includes('=') &&
			commandValueOptions.has(argument.slice(2)) &&
			rawArguments[index + 1] === '-'
		) {
			result.push(`${argument}=-`);
			index++;
		} else {
			result.push(argument);
		}
	}
	return result;
}

if (command.help || (process.argv.length <= 2 && process.stdin.isTTY)) {
	console.log(`\n${help}\n`);
} else if (command.version) {
	console.log(`rollup v${package_.version}`);
} else {
	const promise = run(command);
	if (command.forceExit) {
		promise.then(() => process.exit());
	}
}
