import process from 'node:process';
import type { RollupError } from '../src/rollup/types';
import { bold, cyan, dim, red } from '../src/utils/colors';
import relativeId from '../src/utils/relativeId';

// log to stderr to keep `rollup main.js > bundle.js` from breaking
export const stderr = (...parameters: readonly unknown[]) =>
	process.stderr.write(`${parameters.join('')}\n`);

export function handleError(error: RollupError, recover = false): void {
	const name = error.name || error.cause?.name;
	const nameSection = name ? `${name}: ` : '';
	const pluginSection = error.plugin ? `(plugin ${error.plugin}) ` : '';
	const message = `${pluginSection}${nameSection}${error.message}`;

	stderr(bold(red(`[!] ${bold(message.toString())}`)));

	if (error.url) {
		stderr(cyan(error.url));
	}

	if (error.loc) {
		stderr(`${relativeId((error.loc.file || error.id)!)} (${error.loc.line}:${error.loc.column})`);
	} else if (error.id) {
		stderr(relativeId(error.id));
	}

	if (error.frame) {
		stderr(dim(error.frame));
	}

	if (error.stack) {
		stderr(dim(error.stack?.replace(`${nameSection}${error.message}\n`, '')));
	}

	stderr('');

	// eslint-disable-next-line unicorn/no-process-exit
	if (!recover) process.exit(1);
}
