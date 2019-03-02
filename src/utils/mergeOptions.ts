import { InputOptions, OutputOptions, WarningHandler } from '../rollup/types';

export interface GenericConfigObject {
	[key: string]: any;
}

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
		return commandOption && configOption ? { ...configOption, ...commandOption } : commandOption;
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
	d: 'dir',
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
	defaultOnWarnHandler
}: {
	command?: GenericConfigObject;
	config: GenericConfigObject;
	defaultOnWarnHandler?: WarningHandler;
}): {
	inputOptions: any;
	optionError: string | null;
	outputOptions: any;
} {
	const command = getCommandOptions(rawCommandOptions);
	const inputOptions = getInputOptions(config, command, defaultOnWarnHandler);

	if (command.output) {
		Object.assign(command, command.output);
	}

	const output = config.output;
	const normalizedOutputOptions = Array.isArray(output) ? output : output ? [output] : [];
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

	const validCliOutputOptions = validOutputOptions.filter(
		option => option !== 'sourcemapPathTransform'
	);
	addUnknownOptionErrors(
		unknownOptionErrors,
		Object.keys(command),
		validInputOptions.concat(
			validCliOutputOptions,
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
		optionError: unknownOptionErrors.length > 0 ? unknownOptionErrors.join('\n') : null,
		outputOptions
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
	const command = { ...rawCommandOptions };
	command.external = rawCommandOptions.external ? rawCommandOptions.external.split(',') : [];

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
		chunkGroupingSize: getOption('chunkGroupingSize', 5000),
		context: config.context,
		experimentalCacheExpiry: getOption('experimentalCacheExpiry', 10),
		experimentalOptimizeChunks: getOption('experimentalOptimizeChunks'),
		experimentalTopLevelAwait: getOption('experimentalTopLevelAwait'),
		external: getExternal(config, command),
		inlineDynamicImports: getOption('inlineDynamicImports', false),
		input: getOption('input'),
		manualChunks: getOption('manualChunks'),
		moduleContext: config.moduleContext,
		onwarn: getOnWarn(config, command, defaultOnWarnHandler),
		perf: getOption('perf', false),
		plugins: config.plugins,
		preserveModules: getOption('preserveModules'),
		preserveSymlinks: getOption('preserveSymlinks'),
		shimMissingExports: getOption('shimMissingExports'),
		treeshake: getObjectOption(config, command, 'treeshake'),
		watch: config.watch
	};

	// support rollup({ cache: prevBuildObject })
	if (inputOptions.cache && (<any>inputOptions.cache).cache)
		inputOptions.cache = (<any>inputOptions.cache).cache;

	return inputOptions;
}

function getOutputOptions(
	config: GenericConfigObject,
	command: GenericConfigObject = {}
): OutputOptions {
	const getOption = createGetOption(config, command);
	const format = getOption('format');

	return {
		amd: { ...config.amd, ...command.amd },
		assetFileNames: getOption('assetFileNames'),
		banner: getOption('banner'),
		chunkFileNames: getOption('chunkFileNames'),
		compact: getOption('compact', false),
		dir: getOption('dir'),
		dynamicImportFunction: getOption('dynamicImportFunction'),
		entryFileNames: getOption('entryFileNames'),
		esModule: getOption('esModule', true),
		exports: getOption('exports'),
		extend: getOption('extend'),
		file: getOption('file'),
		footer: getOption('footer'),
		format: format === 'esm' ? 'es' : format,
		freeze: getOption('freeze', true),
		globals: getOption('globals'),
		indent: getOption('indent', true),
		interop: getOption('interop', true),
		intro: getOption('intro'),
		name: getOption('name'),
		namespaceToStringTag: getOption('namespaceToStringTag', false),
		noConflict: getOption('noConflict'),
		outro: getOption('outro'),
		paths: getOption('paths'),
		preferConst: getOption('preferConst'),
		sourcemap: getOption('sourcemap'),
		sourcemapExcludeSources: getOption('sourcemapExcludeSources'),
		sourcemapFile: getOption('sourcemapFile'),
		sourcemapPathTransform: getOption('sourcemapPathTransform'),
		strict: getOption('strict', true)
	};
}
