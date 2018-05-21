import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import { handleError, stderr } from '../logging';
import relativeId from '../../../src/utils/relativeId';
import { mapSequence } from '../../../src/utils/promise';
import SOURCEMAPPING_URL from '../sourceMappingUrl';
import {
	InputOptions,
	OutputChunk,
	OutputOptions,
	RollupFileBuild,
	RollupBuild,
	OutputBundle
} from '../../../src/rollup/types';
import { BatchWarnings } from './batchWarnings';
import { printTimings } from './timings';

export default function build(
	inputOptions: InputOptions,
	outputOptions: OutputOptions[],
	warnings: BatchWarnings,
	silent = false
) {
	const useStdout =
		outputOptions.length === 1 &&
		!outputOptions[0].file &&
		!outputOptions[0].dir &&
		inputOptions.input instanceof Array === false &&
		typeof inputOptions.input !== 'object';

	const start = Date.now();
	const files = useStdout ? ['stdout'] : outputOptions.map(t => relativeId(t.file || t.dir));
	if (!silent) {
		let inputFiles: string;
		if (typeof inputOptions.input === 'string') {
			inputFiles = inputOptions.input;
		} else if (inputOptions.input instanceof Array) {
			inputFiles = inputOptions.input.join(', ');
		} else if (typeof inputOptions.input === 'object' && inputOptions.input !== null) {
			inputFiles = Object.keys(inputOptions.input)
				.map(name => (<Record<string, string>>inputOptions.input)[name])
				.join(', ');
		}
		stderr(chalk.cyan(`\n${chalk.bold(inputFiles)} → ${chalk.bold(files.join(', '))}...`));
	}

	return rollup
		.rollup(inputOptions)
		.then((bundle: RollupFileBuild | RollupBuild) => {
			if (useStdout) {
				const output = outputOptions[0];
				if (output.sourcemap && output.sourcemap !== 'inline') {
					handleError({
						code: 'MISSING_OUTPUT_OPTION',
						message: 'You must specify a --file (-o) option when creating a file with a sourcemap'
					});
				}

				return (<RollupFileBuild>bundle).generate(output).then(({ code, map }) => {
					if (!code) return;
					if (output.sourcemap === 'inline') {
						code += `\n//# ${SOURCEMAPPING_URL}=${map.toUrl()}\n`;
					}

					process.stdout.write(code);
				});
			}

			return mapSequence<OutputOptions, Promise<OutputChunk | OutputBundle>>(
				outputOptions,
				output => bundle.write(output)
			).then(() => bundle);
		})
		.then((bundle?: RollupFileBuild | RollupBuild) => {
			warnings.flush();
			if (!silent)
				stderr(
					chalk.green(
						`created ${chalk.bold(files.join(', '))} in ${chalk.bold(ms(Date.now() - start))}`
					)
				);
			if (bundle && bundle.getTimings) {
				printTimings(bundle.getTimings());
			}
		})
		.catch(handleError);
}
