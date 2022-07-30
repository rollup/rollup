import process from 'process';
import type { RollupError } from '../src/rollup/types';
import { bold, cyan, dim, red } from '../src/utils/colors';
import relativeId from '../src/utils/relativeId';

// log to stderr to keep `rollup main.js > bundle.js` from breaking
export const stderr = (...args: readonly unknown[]) => process.stderr.write(`${args.join('')}\n`);

export function handleError(err: RollupError, recover = false): void {
	const name = err.name || err.cause?.name;
	const nameSection = name ? `${name}: ` : '';
	const pluginSection = err.plugin ? `(plugin ${err.plugin}) ` : '';
	const message = `${pluginSection}${nameSection}${err.message}`;

	stderr(bold(red(`[!] ${bold(message.toString())}`)));

	if (err.url) {
		stderr(cyan(err.url));
	}

	if (err.loc) {
		stderr(`${relativeId((err.loc.file || err.id)!)} (${err.loc.line}:${err.loc.column})`);
	} else if (err.id) {
		stderr(relativeId(err.id));
	}

	if (err.frame) {
		stderr(dim(err.frame));
	}

	if (err.stack) {
		stderr(dim(err.stack));
	}

	stderr('');

	if (!recover) process.exit(1);
}
