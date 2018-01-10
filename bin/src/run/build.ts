import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import { handleError, stderr } from '../logging.js';
import relativeId from '../../../src/utils/relativeId.js';
import { mapSequence } from '../../../src/utils/promise.js';
import SOURCEMAPPING_URL from '../sourceMappingUrl.js';
import { InputOptions, OutputOptions, OutputBundle } from '../../../src/rollup/index';
import { BatchWarnings } from './batchWarnings';
import { SourceMap } from 'magic-string';

export default function build (inputOptions: InputOptions, outputOptions: OutputOptions[], warnings: BatchWarnings, silent = false) {
	const useStdout = outputOptions.length === 1 && !outputOptions[0].file;

	const start = Date.now();
	const files = useStdout
		? ['stdout']
		: outputOptions.map(t => relativeId(t.file));
	if (!silent)
		stderr(
			chalk.cyan(
				`\n${chalk.bold(inputOptions.input)} → ${chalk.bold(
					files.join(', ')
				)}...`
			)
		);

	return rollup
		.rollup(inputOptions)
		.then((bundle: OutputBundle) => {
			if (useStdout) {
				const output = outputOptions[0];
				if (output.sourcemap && output.sourcemap !== 'inline') {
					handleError({
						code: 'MISSING_OUTPUT_OPTION',
						message:
							'You must specify an --output (-o) option when creating a file with a sourcemap'
					});
				}

				return bundle.generate(output).then(({ code, map }: { code: string, map: SourceMap }) => {
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
				stderr(
					chalk.green(
						`created ${chalk.bold(files.join(', '))} in ${chalk.bold(
							ms(Date.now() - start)
						)}`
					)
				);
		})
		.catch(handleError);
}
