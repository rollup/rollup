import tc from 'turbocolor';
import { RollupError } from '../../src/rollup/types';
import relativeId from '../../src/utils/relativeId';

// log to stderr to keep `rollup main.js > bundle.js` from breaking
export const stderr = console.error.bind(console);

export function handleError(err: RollupError, recover = false) {
	let description = err.message || err;
	if (err.name) description = `${err.name}: ${description}`;
	const message =
		((err as { plugin?: string }).plugin
			? `(plugin ${(err as { plugin?: string }).plugin}) ${description}`
			: description) || err;

	stderr(tc.bold.red(`[!] ${tc.bold(message.toString())}`));

	if (err.url) {
		stderr(tc.cyan(err.url));
	}

	if (err.loc) {
		stderr(`${relativeId((err.loc.file || err.id) as string)} (${err.loc.line}:${err.loc.column})`);
	} else if (err.id) {
		stderr(relativeId(err.id));
	}

	if (err.frame) {
		stderr(tc.dim(err.frame));
	}

	if (err.stack) {
		stderr(tc.dim(err.stack));
	}

	stderr('');

	if (!recover) process.exit(1);
}
