import help from 'help.md';
import minimist from 'minimist';
import { version } from 'package.json';
import { commandAliases } from '../../src/utils/mergeOptions';
import run from './run/index';

const command = minimist(process.argv.slice(2), {
	alias: commandAliases
});

if (command.help || (process.argv.length <= 2 && process.stdin.isTTY)) {
	console.log(`\n${help.replace('__VERSION__', version)}\n`); // eslint-disable-line no-console
} else if (command.version) {
	console.log(`rollup v${version}`); // eslint-disable-line no-console
} else {
	try {
		require('source-map-support').install();
	} catch (err) {
		// do nothing
	}

	run(command);
}
