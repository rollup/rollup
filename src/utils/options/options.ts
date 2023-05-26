import type {
	InputOptions,
	InputPluginOption,
	LogHandler,
	NormalizedGeneratedCodeOptions,
	NormalizedOutputOptions,
	NormalizedTreeshakingOptions,
	OutputOptions,
	OutputPlugin,
	OutputPluginOption,
	Plugin,
	RollupLog,
	RollupLogWithLevel,
	RollupLogWithOptionalLevel,
	WarningHandler
} from '../../rollup/types';
import { asyncFlatten } from '../asyncFlatten';
import { EMPTY_ARRAY } from '../blank';
import { addLogLevel, error, errorInvalidOption, errorUnknownOption } from '../error';
import { printQuotedStringList } from '../printStringList';
import relativeId from '../relativeId';

export interface GenericConfigObject {
	[key: string]: unknown;
}

export const normalizeWarning = (warning: string | RollupLog): RollupLog =>
	typeof warning === 'string' ? { message: warning } : warning;

export const normalizeLog = (log: string | RollupLogWithOptionalLevel): RollupLogWithLevel =>
	typeof log === 'string'
		? { level: 'info', message: log }
		: typeof log.level === 'string'
		? (log as RollupLogWithLevel)
		: { level: 'info' as const, ...log };

// TODO Lukas this should print the augmented warning
export const defaultOnWarn: WarningHandler = warning => console.warn(warning.message);

export const getExtendedLogMessage = (log: RollupLog): string => {
	let prefix = '';

	if (log.plugin) {
		prefix += `(${log.plugin} plugin) `;
	}
	if (log.loc) {
		prefix += `${relativeId(log.loc.file!)} (${log.loc.line}:${log.loc.column}) `;
	}

	return prefix + log.message;
};

export const defaultPrintLog: LogHandler = log => {
	const message = getExtendedLogMessage(log);
	switch (log.level) {
		case 'warn': {
			return console.warn(message);
		}
		case 'debug': {
			return console.debug(message);
		}
		default: {
			return console.info(message);
		}
	}
};

export function warnUnknownOptions(
	passedOptions: object,
	validOptions: readonly string[],
	optionType: string,
	log: LogHandler,
	ignoredKeys = /$./
): void {
	const validOptionSet = new Set(validOptions);
	const unknownOptions = Object.keys(passedOptions).filter(
		key => !(validOptionSet.has(key) || ignoredKeys.test(key))
	);
	if (unknownOptions.length > 0) {
		log(
			addLogLevel(
				'warn',
				errorUnknownOption(optionType, unknownOptions, [...validOptionSet].sort())
			)
		);
	}
}

type ObjectValue<Base> = Base extends Record<string, any> ? Base : never;

export const treeshakePresets: {
	[key in NonNullable<
		ObjectValue<InputOptions['treeshake']>['preset']
	>]: NormalizedTreeshakingOptions;
} = {
	recommended: {
		annotations: true,
		correctVarValueBeforeDeclaration: false,
		manualPureFunctions: EMPTY_ARRAY,
		moduleSideEffects: () => true,
		propertyReadSideEffects: true,
		tryCatchDeoptimization: true,
		unknownGlobalSideEffects: false
	},
	safest: {
		annotations: true,
		correctVarValueBeforeDeclaration: true,
		manualPureFunctions: EMPTY_ARRAY,
		moduleSideEffects: () => true,
		propertyReadSideEffects: true,
		tryCatchDeoptimization: true,
		unknownGlobalSideEffects: true
	},
	smallest: {
		annotations: true,
		correctVarValueBeforeDeclaration: false,
		manualPureFunctions: EMPTY_ARRAY,
		moduleSideEffects: () => false,
		propertyReadSideEffects: false,
		tryCatchDeoptimization: false,
		unknownGlobalSideEffects: false
	}
};

export const generatedCodePresets: {
	[key in NonNullable<
		ObjectValue<OutputOptions['generatedCode']>['preset']
	>]: NormalizedOutputOptions['generatedCode'];
} = {
	es2015: {
		arrowFunctions: true,
		constBindings: true,
		objectShorthand: true,
		reservedNamesAsProps: true,
		symbols: true
	},
	es5: {
		arrowFunctions: false,
		constBindings: false,
		objectShorthand: false,
		reservedNamesAsProps: true,
		symbols: false
	}
};

type ObjectOptionWithPresets =
	| Partial<NormalizedTreeshakingOptions>
	| Partial<NormalizedGeneratedCodeOptions>;

export const objectifyOption = (value: unknown): Record<string, unknown> =>
	value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const objectifyOptionWithPresets =
	<T extends ObjectOptionWithPresets>(
		presets: Record<string, T>,
		optionName: string,
		urlSnippet: string,
		additionalValues: string
	) =>
	(value: unknown): Record<string, unknown> => {
		if (typeof value === 'string') {
			const preset = presets[value];
			if (preset) {
				return preset;
			}
			error(
				errorInvalidOption(
					optionName,
					urlSnippet,
					`valid values are ${additionalValues}${printQuotedStringList(
						Object.keys(presets)
					)}. You can also supply an object for more fine-grained control`,
					value
				)
			);
		}
		return objectifyOption(value);
	};

export const getOptionWithPreset = <T extends ObjectOptionWithPresets>(
	value: unknown,
	presets: Record<string, T>,
	optionName: string,
	urlSnippet: string,
	additionalValues: string
): Record<string, unknown> => {
	const presetName: string | undefined = (value as any)?.preset;
	if (presetName) {
		const preset = presets[presetName];
		if (preset) {
			return { ...preset, ...(value as Record<string, unknown>) };
		} else {
			error(
				errorInvalidOption(
					`${optionName}.preset`,
					urlSnippet,
					`valid values are ${printQuotedStringList(Object.keys(presets))}`,
					presetName
				)
			);
		}
	}
	return objectifyOptionWithPresets(presets, optionName, urlSnippet, additionalValues)(value);
};

export const normalizePluginOption: {
	(plugins: InputPluginOption): Promise<Plugin[]>;
	(plugins: OutputPluginOption): Promise<OutputPlugin[]>;
	(plugins: unknown): Promise<any[]>;
} = async (plugins: any) => (await asyncFlatten([plugins])).filter(Boolean);
