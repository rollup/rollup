import ms from 'pretty-ms';
import * as rollup from 'rollup';
import tc from 'turbocolor';
import {
	InputOptions,
	OutputBundle,
	OutputChunk,
	OutputOptions,
	RollupBuild,
	RollupSingleFileBuild
} from '../../../src/rollup/types';
import { mapSequence } from '../../../src/utils/promise';
import relativeId from '../../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import SOURCEMAPPING_URL from '../sourceMappingUrl';
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
		stderr(tc.cyan(`\n${tc.bold(inputFiles)} → ${tc.bold(files.join(', '))}...`));
	}

	return rollup
		.rollup(inputOptions)
		.then((bundle: RollupSingleFileBuild | RollupBuild) => {
			if (useStdout) {
				const output = outputOptions[0];
				if (output.sourcemap && output.sourcemap !== 'inline') {
					handleError({
						code: 'MISSING_OUTPUT_OPTION',
						message: 'You must specify a --file (-o) option when creating a file with a sourcemap'
					});
				}

				return (<RollupSingleFileBuild>bundle).generate(output).then(({ code, map }) => {
					if (!code) return;
					if (output.sourcemap === 'inline') {
						code += `\n//# ${SOURCEMAPPING_URL}=${map.toUrl()}\n`;
					}

					process.stdout.write(code);
				});
			}

			return mapSequence<OutputOptions, Promise<OutputChunk | { output: OutputBundle }>>(
				outputOptions,
				output => bundle.write(output)
			).then(() => bundle);
		})
		.then((bundle?: RollupSingleFileBuild | RollupBuild) => {
			warnings.flush();
			if (!silent)
				stderr(
					tc.green(`created ${tc.bold(files.join(', '))} in ${tc.bold(ms(Date.now() - start))}`)
				);
			if (bundle && bundle.getTimings) {
				printTimings(bundle.getTimings());
			}
		})
		.catch(handleError);
}
