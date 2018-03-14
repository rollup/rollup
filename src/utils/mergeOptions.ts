import ensureArray from './ensureArray';
import deprecateOptions, { Deprecation } from './deprecateOptions';
import { InputOptions, OutputOptions, WarningHandler } from '../rollup/index';

function normalizeObjectOptionValue(optionValue: any) {
	if (!optionValue) {
		return optionValue;
	}
	if (typeof optionValue !== 'object') {
		return {};
	}
	return optionValue;
}

const defaultOnWarn: WarningHandler = warning => {
	if (typeof warning === 'string') {
		console.warn(warning); // eslint-disable-line no-console
	} else {
		console.warn(warning.message); // eslint-disable-line no-console
	}
};

export type GenericConfigObject = { [key: string]: any };

export default function mergeOptions({
	config,
	command = {},
	deprecateConfig,
	defaultOnWarnHandler = defaultOnWarn
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
	const deprecations = deprecate(config, command, deprecateConfig);

	const getOption = (config: GenericConfigObject) => (name: string) =>
		command[name] !== undefined ? command[name] : config[name];

	const getInputOption = getOption(config);
	const getOutputOption = getOption(config.output || {});

	function getObjectOption(name: string) {
		const commandOption = normalizeObjectOptionValue(command[name]);
		const configOption = normalizeObjectOptionValue(config[name]);
		if (commandOption !== undefined) {
			return commandOption && configOption
				? Object.assign({}, configOption, commandOption)
				: commandOption;
		}
		return configOption;
	}

	const onwarn = config.onwarn;
	let warn: WarningHandler;

	if (onwarn) {
		warn = warning => onwarn(warning, defaultOnWarnHandler);
	} else {
		warn = defaultOnWarnHandler;
	}

	const inputOptions: InputOptions = {
		acorn: config.acorn,
		acornInjectPlugins: config.acornInjectPlugins,
		cache: getInputOption('cache'),
		context: config.context,
		experimentalCodeSplitting: getInputOption('experimentalCodeSplitting'),
		experimentalDynamicImport: getInputOption('experimentalDynamicImport'),
		experimentalPreserveModules: getInputOption('experimentalPreserveModules'),
		input: getInputOption('input'),
		legacy: getInputOption('legacy'),
		moduleContext: config.moduleContext,
		onwarn: warn,
		perf: getInputOption('perf'),
		plugins: config.plugins,
		preferConst: getInputOption('preferConst'),
		preserveSymlinks: getInputOption('preserveSymlinks'),
		treeshake: getObjectOption('treeshake'),
		watch: config.watch
	};

	// legacy, to ensure e.g. commonjs plugin still works
	(<any>inputOptions).entry = inputOptions.input;

	const commandExternal = (command.external || '').split(',');
	const configExternal = config.external;

	if (command.globals) {
		const globals = Object.create(null);

		command.globals.split(',').forEach((str: string) => {
			const names = str.split(':');
			globals[names[0]] = names[1];

			// Add missing Module IDs to external.
			if (commandExternal.indexOf(names[0]) === -1) {
				commandExternal.push(names[0]);
			}
		});

		command.globals = globals;
	}

	if (typeof configExternal === 'function') {
		inputOptions.external = (id, ...rest: any[]) =>
			configExternal(id, ...rest) || commandExternal.indexOf(id) !== -1;
	} else {
		inputOptions.external = (configExternal || []).concat(commandExternal);
	}

	if (command.silent) {
		inputOptions.onwarn = () => {};
	}

	// Make sure the CLI treats this the same way as when we are code-splitting
	if (inputOptions.experimentalPreserveModules && !Array.isArray(inputOptions.input)) {
		inputOptions.input = [inputOptions.input];
	}

	const baseOutputOptions = {
		amd: Object.assign({}, config.amd, command.amd),
		banner: getOutputOption('banner'),
		dir: getOutputOption('dir'),
		exports: getOutputOption('exports'),
		extend: getOutputOption('extend'),
		file: getOutputOption('file'),
		footer: getOutputOption('footer'),
		format: getOutputOption('format'),
		freeze: getOutputOption('freeze'),
		globals: getOutputOption('globals'),
		indent: getOutputOption('indent'),
		interop: getOutputOption('interop'),
		intro: getOutputOption('intro'),
		legacy: getOutputOption('legacy'),
		name: getOutputOption('name'),
		namespaceToStringTag: getOutputOption('namespaceToStringTag'),
		noConflict: getOutputOption('noConflict'),
		outro: getOutputOption('outro'),
		paths: getOutputOption('paths'),
		sourcemap: getOutputOption('sourcemap'),
		sourcemapFile: getOutputOption('sourcemapFile'),
		strict: getOutputOption('strict')
	};

	let mergedOutputOptions;
	if (Array.isArray(config.output)) {
		mergedOutputOptions = config.output.map((output: any) =>
			Object.assign({}, output, command.output)
		);
	} else if (config.output && command.output) {
		mergedOutputOptions = [Object.assign({}, config.output, command.output)];
	} else {
		mergedOutputOptions =
			command.output || config.output
				? ensureArray(command.output || config.output)
				: [
						{
							file: command.output ? command.output.file : null,
							format: command.output ? command.output.format : null
						}
				  ];
	}

	const outputOptions = mergedOutputOptions.map((output: any) => {
		return Object.assign({}, baseOutputOptions, output);
	});

	// check for errors
	const validKeys = [
		...Object.keys(inputOptions),
		...Object.keys(baseOutputOptions),
		'pureExternalModules' // (backward compatibility) till everyone moves to treeshake.pureExternalModules
	];
	const outputOptionKeys: string[] = Array.isArray(config.output)
		? config.output.reduce((keys: string[], o: OutputOptions) => [...keys, ...Object.keys(o)], [])
		: Object.keys(config.output || {});
	const errors = [...Object.keys(config || {}), ...outputOptionKeys].filter(
		k => k !== 'output' && validKeys.indexOf(k) === -1
	);

	return {
		inputOptions,
		outputOptions,
		deprecations,
		optionError: errors.length
			? `Unknown option found: ${errors.join(', ')}. Allowed keys: ${validKeys.join(', ')}`
			: null
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
			new: '--output.file'
		});
		command.output = { file: command.output };
	}

	if (command.format) {
		deprecations.push({
			old: '--format',
			new: '--output.format'
		});
		(command.output || (command.output = {})).format = command.format;
	}

	// config file
	deprecations.push(...deprecateOptions(config, deprecateConfig));
	return deprecations;
}
