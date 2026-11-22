#!/usr/bin/env node
import help from 'help.md';
import process from 'node:process';
import argParser from 'yargs-parser';
import package_ from '../package.json' with { type: 'json' };
import { commandAliases } from '../src/utils/options/mergeOptions';
import run from './run/index';

const command = argParser(normalizeDashOptionValues(process.argv.slice(2)), {
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
		promise.then(() => process.exit());
	}
}

function normalizeDashOptionValues(cliArguments: string[]): string[] {
	const normalizedArguments: string[] = [];
	for (let index = 0; index < cliArguments.length; index++) {
		const argument = cliArguments[index];
		if (argument === '--') {
			return normalizedArguments.concat(cliArguments.slice(index));
		}
		if ((argument === '--input' || argument === '--file') && cliArguments[index + 1] === '-') {
			normalizedArguments.push(`${argument}=-`);
			index++;
		} else {
			normalizedArguments.push(argument);
		}
	}
	return normalizedArguments;
}
