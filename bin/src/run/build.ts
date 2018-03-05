import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import { handleError, stderr } from '../logging';
import relativeId from '../../../src/utils/relativeId';
import { mapSequence } from '../../../src/utils/promise';
import SOURCEMAPPING_URL from '../sourceMappingUrl';
import { InputOptions, OutputOptions, OutputChunk } from '../../../src/rollup/index';
import { BatchWarnings } from './batchWarnings';
import { SourceMap } from 'magic-string';

export default function build(
	inputOptions: InputOptions,
	outputOptions: OutputOptions[],
	warnings: BatchWarnings,
	silent = false
) {
	const useStdout =
		outputOptions.length === 1 && !outputOptions[0].file && inputOptions.input instanceof Array === false;

	const start = Date.now();
	const files = useStdout ? ['stdout'] : outputOptions.map(t => relativeId(t.file || t.dir));
	if (!silent)
		stderr(
			chalk.cyan(
				`\n${chalk.bold(
					typeof inputOptions.input === 'string'
						? inputOptions.input
						: inputOptions.input && inputOptions.input.join(', ')
				)} → ${chalk.bold(files.join(', '))}...`
			)
		);

	return rollup
		.rollup(inputOptions)
		.then((bundle: OutputChunk) => {
			if (useStdout) {
				const output = outputOptions[0];
				if (output.sourcemap && output.sourcemap !== 'inline') {
					handleError({
						code: 'MISSING_OUTPUT_OPTION',
						message: 'You must specify an --output (-o) option when creating a file with a sourcemap'
					});
				}

				return bundle.generate(output).then(({ code, map }: { code: string; map: SourceMap }) => {
					if (output.sourcemap === 'inline') {
						code += `\n//# ${SOURCEMAPPING_URL}=${map.toUrl()}\n`;
					}

					process.stdout.write(code);
				});
			}

			return mapSequence(outputOptions, output => {
				return bundle.write(output);
			});
		})
		.then(() => {
			warnings.flush();
			if (!silent)
				stderr(chalk.green(`created ${chalk.bold(files.join(', '))} in ${chalk.bold(ms(Date.now() - start))}`));
		})
		.catch(handleError);
}
