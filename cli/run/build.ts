import process from 'node:process';
import ms from 'pretty-ms';
import { rollup } from '../../src/node-entry';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { bold, cyan, green } from '../../src/utils/colors';
import { logOnlyInlineSourcemapsForStdout } from '../../src/utils/logs';
import relativeId from '../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import type { BatchWarnings } from './loadConfigFileType';
import { printTimings } from './timings';

export default async function build(
	inputOptions: MergedRollupOptions,
	warnings: BatchWarnings,
	silent = false
): Promise<unknown> {
	const outputOptions = inputOptions.output;
	const useStdout = !outputOptions[0].file && !outputOptions[0].dir;
	const start = Date.now();
	const files = useStdout ? ['stdout'] : outputOptions.map(t => relativeId(t.file || t.dir!));
	if (!silent) {
		let inputFiles: string | undefined;
		if (typeof inputOptions.input === 'string') {
			inputFiles = inputOptions.input;
		} else if (Array.isArray(inputOptions.input)) {
			inputFiles = inputOptions.input.join(', ');
		} else if (typeof inputOptions.input === 'object' && inputOptions.input !== null) {
			inputFiles = Object.values(inputOptions.input).join(', ');
		}
		stderr(cyan(`\n${bold(inputFiles!)} → ${bold(files.join(', '))}...`));
	}

	await using bundle = await rollup(inputOptions as any);
	if (useStdout) {
		const output = outputOptions[0];
		if (output.sourcemap && output.sourcemap !== 'inline') {
			handleError(logOnlyInlineSourcemapsForStdout());
		}
		const { output: outputs } = await bundle.generate(output);
		for (const file of outputs) {
			if (outputs.length > 1) process.stdout.write(`\n${cyan(bold(`//→ ${file.fileName}:`))}\n`);
			process.stdout.write(file.type === 'asset' ? file.source : file.code);
		}
		if (!silent) {
			warnings.flush();
		}
		return;
	}

	await Promise.all(outputOptions.map(bundle.write));
	if (!silent) {
		warnings.flush();
		stderr(green(`created ${bold(files.join(', '))} in ${bold(ms(Date.now() - start))}`));
		if (bundle && bundle.getTimings) {
			printTimings(bundle.getTimings());
		}
	}
}
