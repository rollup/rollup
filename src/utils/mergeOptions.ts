import ensureArray from './ensureArray';
import deprecateOptions, { Deprecation } from './deprecateOptions';
import { InputOptions, OutputOptions, WarningHandler } from '../rollup/types';

export type GenericConfigObject = { [key: string]: any };

const createGetOption = (config: GenericConfigObject, command: GenericConfigObject) => (
	name: string,
	defaultValue?: any
) =>
	command[name] !== undefined
		? command[name]
		: config[name] !== undefined
			? config[name]
			: defaultValue;

const normalizeObjectOptionValue = (optionValue: any) => {
	if (!optionValue) {
		return optionValue;
	}
	if (typeof optionValue !== 'object') {
		return {};
	}
	return optionValue;
};

const getObjectOption = (
	config: GenericConfigObject,
	command: GenericConfigObject,
	name: string
) => {
	const commandOption = normalizeObjectOptionValue(command[name]);
	const configOption = normalizeObjectOptionValue(config[name]);
	if (commandOption !== undefined) {
		return commandOption && configOption
			? Object.assign({}, configOption, commandOption)
			: commandOption;
	}
	return configOption;
};

const defaultOnWarn: WarningHandler = warning => {
	if (typeof warning === 'string') {
		console.warn(warning); // eslint-disable-line no-console
	} else {
		console.warn(warning.message); // eslint-disable-line no-console
	}
};

const getOnWarn = (
	config: GenericConfigObject,
	command: GenericConfigObject,
	defaultOnWarnHandler: WarningHandler = defaultOnWarn
): WarningHandler =>
	command.silent
		? () => {}
		: config.onwarn
			? warning => config.onwarn(warning, defaultOnWarnHandler)
			: defaultOnWarnHandler;

const getExternal = (config: GenericConfigObject, command: GenericConfigObject) => {
	const configExternal = config.external;
	return typeof configExternal === 'function'
		? (id: string, ...rest: string[]) =>
				configExternal(id, ...rest) || command.external.indexOf(id) !== -1
		: (configExternal || []).concat(command.external);
};

export const commandAliases: { [key: string]: string } = {
	c: 'config',
	e: 'external',
	f: 'format',
	g: 'globals',
	h: 'help',
	i: 'input',
	m: 'sourcemap',
	n: 'name',
	o: 'file',
	v: 'version',
	w: 'watch'
};

export default function mergeOptions({
	config = {},
	command: rawCommandOptions = {},
	deprecateConfig,
	defaultOnWarnHandler
}: {
	config: GenericConfigObject;
	command?: GenericConfigObject;
	deprecateConfig?: GenericConfigObject;
	defaultOnWarnHandler?: WarningHandler;
}): {
	inputOptions: any;
	outputOptions: any;
	deprecations: Deprecation[];
	optionError: string | null;
} {
	const deprecations = deprecate(config, rawCommandOptions, deprecateConfig);
	const command = getCommandOptions(rawCommandOptions);
	const inputOptions = getInputOptions(config, command, defaultOnWarnHandler);

	if (command.output) {
		Object.assign(command, command.output);
	}

	const normalizedOutputOptions = ensureArray(config.output);
	if (normalizedOutputOptions.length === 0) normalizedOutputOptions.push({});
	const outputOptions = normalizedOutputOptions.map(singleOutputOptions =>
		getOutputOptions(singleOutputOptions, command)
	);

	const unknownOptionErrors: string[] = [];
	const validInputOptions = Object.keys(inputOptions);
	addUnknownOptionErrors(
		unknownOptionErrors,
		Object.keys(config),
		validInputOptions,
		'input option',
		/^output$/
	);

	const validOutputOptions = Object.keys(outputOptions[0]);
	addUnknownOptionErrors(
		unknownOptionErrors,
		outputOptions.reduce((allKeys, options) => allKeys.concat(Object.keys(options)), []),
		validOutputOptions,
		'output option'
	);

	addUnknownOptionErrors(
		unknownOptionErrors,
		Object.keys(command),
		validInputOptions.concat(
			validOutputOptions,
			Object.keys(commandAliases),
			'config',
			'environment',
			'silent'
		),
		'CLI flag',
		/^_|output|(config.*)$/
	);

	return {
		inputOptions,
		outputOptions,
		deprecations,
		optionError: unknownOptionErrors.length > 0 ? unknownOptionErrors.join('\n') : null
	};
}

function addUnknownOptionErrors(
	errors: string[],
	options: string[],
	validOptions: string[],
	optionType: string,
	ignoredKeys: RegExp = /$./
) {
	const unknownOptions = options.filter(
		key => validOptions.indexOf(key) === -1 && !ignoredKeys.test(key)
	);
	if (unknownOptions.length > 0)
		errors.push(
			`Unknown ${optionType}: ${unknownOptions.join(
				', '
			)}. Allowed options: ${validOptions.sort().join(', ')}`
		);
}

function getCommandOptions(rawCommandOptions: GenericConfigObject): GenericConfigObject {
	const command = Object.assign({}, rawCommandOptions);
	command.external = (rawCommandOptions.external || '').split(',');

	if (rawCommandOptions.globals) {
		command.globals = Object.create(null);

		rawCommandOptions.globals.split(',').forEach((str: string) => {
			const names = str.split(':');
			command.globals[names[0]] = names[1];

			// Add missing Module IDs to external.
			if (command.external.indexOf(names[0]) === -1) {
				command.external.push(names[0]);
			}
		});
	}
	return command;
}

function getInputOptions(
	config: GenericConfigObject,
	command: GenericConfigObject = {},
	defaultOnWarnHandler: WarningHandler
): InputOptions {
	const getOption = createGetOption(config, command);

	const inputOptions: InputOptions = {
		acorn: config.acorn,
		acornInjectPlugins: config.acornInjectPlugins,
		cache: getOption('cache'),
		context: config.context,
		experimentalCodeSplitting: getOption('experimentalCodeSplitting'),
		experimentalDynamicImport: getOption('experimentalDynamicImport'),
		experimentalPreserveModules: getOption('experimentalPreserveModules'),
		external: getExternal(config, command),
		input: getOption('input'),
		manualChunks: getOption('manualChunks'),
		chunkGroupingSize: getOption('chunkGroupingSize', 5000),
		optimizeChunks: getOption('optimizeChunks'),
		moduleContext: config.moduleContext,
		onwarn: getOnWarn(config, command, defaultOnWarnHandler),
		perf: getOption('perf', false),
		plugins: config.plugins,
		preferConst: getOption('preferConst'),
		preserveSymlinks: getOption('preserveSymlinks'),
		treeshake: getObjectOption(config, command, 'treeshake'),
		watch: config.watch
	};

	// legacy to make sure certain plugins still work
	if (Array.isArray(inputOptions.input)) {
		inputOptions.entry = inputOptions.input[0];
	} else if (typeof inputOptions.input === 'object') {
		for (let name in inputOptions.input) {
			inputOptions.entry = inputOptions.input[name];
			break;
		}
	} else {
		inputOptions.entry = inputOptions.input;
	}
	return inputOptions;
}

function getOutputOptions(
	config: GenericConfigObject,
	command: GenericConfigObject = {}
): OutputOptions {
	const getOption = createGetOption(config, command);
	const format = getOption('format');

	return {
		amd: Object.assign({}, config.amd, command.amd),
		assetFileNames: getOption('assetFileNames'),
		banner: getOption('banner'),
		dir: getOption('dir'),
		chunkFileNames: getOption('chunkFileNames'),
		compact: getOption('compact', false),
		entryFileNames: getOption('entryFileNames'),
		exports: getOption('exports'),
		extend: getOption('extend'),
		file: getOption('file'),
		footer: getOption('footer'),
		format: format === 'esm' ? 'es' : format,
		freeze: getOption('freeze'),
		globals: getOption('globals'),
		indent: getOption('indent', true),
		interop: getOption('interop', true),
		intro: getOption('intro'),
		name: getOption('name'),
		namespaceToStringTag: getOption('namespaceToStringTag'),
		noConflict: getOption('noConflict'),
		outro: getOption('outro'),
		paths: getOption('paths'),
		sourcemap: getOption('sourcemap'),
		sourcemapFile: getOption('sourcemapFile'),
		strict: getOption('strict', true)
	};
}

function deprecate(
	config: GenericConfigObject,
	command: GenericConfigObject = {},
	deprecateConfig: GenericConfigObject = { input: true, output: true }
): Deprecation[] {
	const deprecations = [];

	// CLI
	if (command.id) {
		deprecations.push({
			old: '-u/--id',
			new: '--amd.id'
		});
		(command.amd || (command.amd = {})).id = command.id;
	}

	if (typeof command.output === 'string') {
		deprecations.push({
			old: '--output',
			new: '--file'
		});
		command.output = { file: command.output };
	}

	if (command.d) {
		deprecations.push({
			old: '-d',
			new: '--indent'
		});
		command.indent = command.d;
	}

	// config file
	deprecations.push(...deprecateOptions(config, deprecateConfig));
	return deprecations;
}
