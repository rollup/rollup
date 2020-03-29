import { MergedRollupOptions, WarningHandler } from '../rollup/types';
import {
	CommandConfigObject,
	ensureArray,
	GenericConfigObject,
	parseInputOptions,
	parseOutputOptions,
	warnUnknownOptions,
} from './parseOptions';

export const commandAliases: { [key: string]: string } = {
	c: 'config',
	d: 'dir',
	e: 'external',
	f: 'format',
	g: 'globals',
	h: 'help',
	i: 'input',
	m: 'sourcemap',
	n: 'name',
	o: 'file',
	p: 'plugin',
	v: 'version',
	w: 'watch',
};

export function mergeOptions(
	config: GenericConfigObject,
	rawCommandOptions: GenericConfigObject = { external: [], globals: undefined },
	defaultOnWarnHandler?: WarningHandler
): MergedRollupOptions {
	const command = getCommandOptions(rawCommandOptions);
	const inputOptions = parseInputOptions(config, command, defaultOnWarnHandler);
	const warn = inputOptions.onwarn as WarningHandler;
	if (command.output) {
		Object.assign(command, command.output);
	}
	const outputOptionsArray = ensureArray(config.output) as GenericConfigObject[];
	if (outputOptionsArray.length === 0) outputOptionsArray.push({});
	const outputOptions = outputOptionsArray.map((singleOutputOptions) =>
		parseOutputOptions(singleOutputOptions, warn, command)
	);

	warnUnknownOptions(
		command,
		Object.keys(inputOptions).concat(
			Object.keys(outputOptions[0]).filter((option) => option !== 'sourcemapPathTransform'),
			Object.keys(commandAliases),
			'config',
			'environment',
			'plugin',
			'silent',
			'stdin'
		),
		'CLI flags',
		warn,
		/^_$|output$|config/
	);
	(inputOptions as MergedRollupOptions).output = outputOptions;
	return inputOptions as MergedRollupOptions;
}

function getCommandOptions(rawCommandOptions: GenericConfigObject): CommandConfigObject {
	const external =
		rawCommandOptions.external && typeof rawCommandOptions.external === 'string'
			? rawCommandOptions.external.split(',')
			: [];
	return {
		...rawCommandOptions,
		external,
		globals:
			typeof rawCommandOptions.globals === 'string'
				? rawCommandOptions.globals.split(',').reduce((globals, globalDefinition) => {
						const [id, variableName] = globalDefinition.split(':');
						globals[id] = variableName;
						if (external.indexOf(id) === -1) {
							external.push(id);
						}
						return globals;
				  }, Object.create(null))
				: undefined,
	};
}
