import color from 'colorette';
import ms from 'pretty-ms';
import * as rollup from '../../src/node-entry';
import { InputOptions, OutputOptions, RollupBuild } from '../../src/rollup/types';
import relativeId from '../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import SOURCEMAPPING_URL from '../sourceMappingUrl';
import { BatchWarnings } from './batchWarnings';
import { printTimings } from './timings';

export default function build(
	inputOptions: InputOptions,
	outputOptions: OutputOptions[],
	warnings: BatchWarnings,
	silent = false
): Promise<unknown> {
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
			inputFiles = Object.keys(inputOptions.input)
				.map(name => (inputOptions.input as Record<string, string>)[name])
				.join(', ');
		}
		stderr(color.cyan(`\n${color.bold(inputFiles!)} → ${color.bold(files.join(', '))}...`));
	}

	return rollup
		.rollup(inputOptions as any)
		.then((bundle: RollupBuild) => {
			if (useStdout) {
				const output = outputOptions[0];
				if (output.sourcemap && output.sourcemap !== 'inline') {
					handleError({
						code: 'MISSING_OUTPUT_OPTION',
						message: 'You must specify a --file (-o) option when creating a file with a sourcemap'
					});
				}

				return bundle.generate(output).then(({ output: outputs }) => {
					for (const file of outputs) {
						let source: string | Buffer;
						if (file.type === 'asset') {
							source = file.source;
						} else {
							source = file.code;
							if (output.sourcemap === 'inline') {
								source += `\n//# ${SOURCEMAPPING_URL}=${file.map!.toUrl()}\n`;
							}
						}
						if (outputs.length > 1)
							process.stdout.write('\n' + color.cyan(color.bold('//→ ' + file.fileName + ':')) + '\n');
						process.stdout.write(source);
					}
					return null;
				});
			}

			return Promise.all(outputOptions.map(output => bundle.write(output))).then(() => bundle);
		})
		.then((bundle: RollupBuild | null) => {
			if (!silent) {
				warnings.flush();
				stderr(
					color.green(`created ${color.bold(files.join(', '))} in ${color.bold(ms(Date.now() - start))}`)
				);
				if (bundle && bundle.getTimings) {
					printTimings(bundle.getTimings());
				}
			}
		});
}
