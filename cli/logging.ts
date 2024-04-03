import process from 'node:process';
import type { RollupError } from '../src/rollup/types';
import { bold, cyan, dim, red } from '../src/utils/colors';
import relativeId from '../src/utils/relativeId';

// log to stderr to keep `rollup main.js > bundle.js` from breaking
export const stderr = (...parameters: readonly unknown[]) =>
	process.stderr.write(`${parameters.join('')}\n`);

export function handleError(error: RollupError, recover = false): void {
	const name = error.name || (error.cause as Error)?.name;
	const nameSection = name ? `${name}: ` : '';
	const pluginSection = error.plugin ? `(plugin ${error.plugin}) ` : '';
	const message = `${pluginSection}${nameSection}${error.message}`;

	const outputLines = [bold(red(`[!] ${bold(message.toString())}`))];

	if (error.url) {
		outputLines.push(cyan(error.url));
	}

	if (error.loc) {
		outputLines.push(
			`${relativeId((error.loc.file || error.id)!)} (${error.loc.line}:${error.loc.column})`
		);
	} else if (error.id) {
		outputLines.push(relativeId(error.id));
	}

	if (error.frame) {
		outputLines.push(dim(error.frame));
	}

	if (error.stack) {
		outputLines.push(dim(error.stack?.replace(`${nameSection}${error.message}\n`, '')));
	}

	// ES2022: Error.prototype.cause is optional
	if (error.cause) {
		let cause = error.cause as Error | undefined;
		const causeErrorLines = [];
		let indent = '';

		while (cause) {
			indent += '  ';
			const message = cause.stack || cause;
			causeErrorLines.push(...`[cause] ${message}`.split('\n').map(line => indent + line));

			cause = cause.cause as Error | undefined;
		}

		outputLines.push(dim(causeErrorLines.join('\n')));
	}

	outputLines.push('', '');
	stderr(outputLines.join('\n'));

	if (!recover) process.exit(1);
}
