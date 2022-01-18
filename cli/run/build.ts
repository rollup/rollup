import ms from 'pretty-ms';
import { rollup } from '../../src/node-entry';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { bold, cyan, green } from '../../src/utils/colors';
import relativeId from '../../src/utils/relativeId';
import { SOURCEMAPPING_URL } from '../../src/utils/sourceMappingURL';
import { handleError, stderr } from '../logging';
import type { BatchWarnings } from './batchWarnings';
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
		} else if (inputOptions.input instanceof Array) {
			inputFiles = inputOptions.input.join(', ');
		} else if (typeof inputOptions.input === 'object' && inputOptions.input !== null) {
			inputFiles = Object.values(inputOptions.input).join(', ');
		}
		stderr(cyan(`\n${bold(inputFiles!)} → ${bold(files.join(', '))}...`));
	}

	const bundle = await rollup(inputOptions as any);
	if (useStdout) {
		const output = outputOptions[0];
		if (output.sourcemap && output.sourcemap !== 'inline') {
			handleError({
				code: 'ONLY_INLINE_SOURCEMAPS',
				message: 'Only inline sourcemaps are supported when bundling to stdout.'
			});
		}

		const { output: outputs } = await bundle.generate(output);
		for (const file of outputs) {
			let source: string | Uint8Array;
			if (file.type === 'asset') {
				source = file.source;
			} else {
				source = file.code;
				if (output.sourcemap === 'inline') {
					source += `\n//# ${SOURCEMAPPING_URL}=${file.map!.toUrl()}\n`;
				}
			}
			if (outputs.length > 1) process.stdout.write(`\n${cyan(bold(`//→ ${file.fileName}:`))}\n`);
			process.stdout.write(source as Buffer);
		}
		if (!silent) {
			warnings.flush();
		}
		return;
	}

	await Promise.all(outputOptions.map(bundle.write));
	await bundle.close();
	if (!silent) {
		warnings.flush();
		stderr(green(`created ${bold(files.join(', '))} in ${bold(ms(Date.now() - start))}`));
		if (bundle && bundle.getTimings) {
			printTimings(bundle.getTimings());
		}
	}
}
