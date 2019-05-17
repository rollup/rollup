import help from 'help.md';
import minimist from 'minimist';
import { version } from 'package.json';
import { commandAliases } from '../../src/utils/mergeOptions';
import run from './run/index';

const command = minimist(process.argv.slice(2), {
	alias: commandAliases
});

if (command.help || (process.argv.length <= 2 && process.stdin.isTTY)) {
	console.log(`\n${help.replace('__VERSION__', version)}\n`);
} else if (command.version) {
	console.log(`rollup v${version}`);
} else {
	try {
		require('source-map-support').install();
	} catch (err) {
		// do nothing
	}

	run(command);
}
