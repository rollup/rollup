import { locate } from 'locate-character';
import type Module from '../Module';
import type {
	InternalModuleFormat,
	NormalizedInputOptions,
	RollupLog,
	RollupWarning,
	WarningHandler
} from '../rollup/types';
import getCodeFrame from './getCodeFrame';
import { printQuotedStringList } from './printStringList';
import relativeId from './relativeId';

export function error(base: Error | RollupLog): never {
	if (!(base instanceof Error)) {
		base = Object.assign(new Error(base.message), base);
		Object.defineProperty(base, 'name', { value: 'RollupError' });
	}
	throw base;
}

export function augmentCodeLocation(
	props: RollupLog,
	pos: number | { column: number; line: number },
	source: string,
	id: string
): void {
	if (typeof pos === 'object') {
		const { line, column } = pos;
		props.loc = { column, file: id, line };
	} else {
		props.pos = pos;
		const { line, column } = locate(source, pos, { offsetLine: 1 });
		props.loc = { column, file: id, line };
	}

	if (props.frame === undefined) {
		const { line, column } = props.loc;
		props.frame = getCodeFrame(source, line, column);
	}
}

// Error codes should be sorted alphabetically while errors should be sorted by
// error code below
const ADDON_ERROR = 'ADDON_ERROR',
	ALREADY_CLOSED = 'ALREADY_CLOSED',
	AMBIGUOUS_EXTERNAL_NAMESPACES = 'AMBIGUOUS_EXTERNAL_NAMESPACES',
	ANONYMOUS_PLUGIN_CACHE = 'ANONYMOUS_PLUGIN_CACHE',
	ASSET_NOT_FINALISED = 'ASSET_NOT_FINALISED',
	ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
	ASSET_SOURCE_ALREADY_SET = 'ASSET_SOURCE_ALREADY_SET',
	ASSET_SOURCE_MISSING = 'ASSET_SOURCE_MISSING',
	BAD_LOADER = 'BAD_LOADER',
	CANNOT_CALL_NAMESPACE = 'CANNOT_CALL_NAMESPACE',
	CANNOT_EMIT_FROM_OPTIONS_HOOK = 'CANNOT_EMIT_FROM_OPTIONS_HOOK',
	CHUNK_NOT_GENERATED = 'CHUNK_NOT_GENERATED',
	CHUNK_INVALID = 'CHUNK_INVALID',
	CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
	CIRCULAR_REEXPORT = 'CIRCULAR_REEXPORT',
	CYCLIC_CROSS_CHUNK_REEXPORT = 'CYCLIC_CROSS_CHUNK_REEXPORT',
	DEPRECATED_FEATURE = 'DEPRECATED_FEATURE',
	DUPLICATE_IMPORT_OPTIONS = 'DUPLICATE_IMPORT_OPTIONS',
	DUPLICATE_PLUGIN_NAME = 'DUPLICATE_PLUGIN_NAME',
	EMPTY_BUNDLE = 'EMPTY_BUNDLE',
	EVAL = 'EVAL',
	EXTERNAL_SYNTHETIC_EXPORTS = 'EXTERNAL_SYNTHETIC_EXPORTS',
	FAIL_AFTER_WARNINGS = 'FAIL_AFTER_WARNINGS',
	FILE_NAME_CONFLICT = 'FILE_NAME_CONFLICT',
	FILE_NOT_FOUND = 'FILE_NOT_FOUND',
	ILLEGAL_IDENTIFIER_AS_NAME = 'ILLEGAL_IDENTIFIER_AS_NAME',
	ILLEGAL_REASSIGNMENT = 'ILLEGAL_REASSIGNMENT',
	INPUT_HOOK_IN_OUTPUT_PLUGIN = 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
	INVALID_CHUNK = 'INVALID_CHUNK',
	INVALID_EXPORT_OPTION = 'INVALID_EXPORT_OPTION',
	INVALID_EXTERNAL_ID = 'INVALID_EXTERNAL_ID',
	INVALID_OPTION = 'INVALID_OPTION',
	INVALID_PLUGIN_HOOK = 'INVALID_PLUGIN_HOOK',
	INVALID_ROLLUP_PHASE = 'INVALID_ROLLUP_PHASE',
	INVALID_SETASSETSOURCE = 'INVALID_SETASSETSOURCE',
	INVALID_TLA_FORMAT = 'INVALID_TLA_FORMAT',
	MISSING_CONFIG = 'MISSING_CONFIG',
	MISSING_EXPORT = 'MISSING_EXPORT',
	MISSING_EXTERNAL_CONFIG = 'MISSING_EXTERNAL_CONFIG',
	MISSING_GLOBAL_NAME = 'MISSING_GLOBAL_NAME',
	MISSING_IMPLICIT_DEPENDANT = 'MISSING_IMPLICIT_DEPENDANT',
	MISSING_NAME_OPTION_FOR_IIFE_EXPORT = 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT',
	MISSING_NODE_BUILTINS = 'MISSING_NODE_BUILTINS',
	MISSING_OPTION = 'MISSING_OPTION',
	MIXED_EXPORTS = 'MIXED_EXPORTS',
	MODULE_LEVEL_DIRECTIVE = 'MODULE_LEVEL_DIRECTIVE',
	NAMESPACE_CONFLICT = 'NAMESPACE_CONFLICT',
	NO_FS_IN_BROWSER = 'NO_FS_IN_BROWSER',
	NO_TRANSFORM_MAP_OR_AST_WITHOUT_CODE = 'NO_TRANSFORM_MAP_OR_AST_WITHOUT_CODE',
	ONLY_INLINE_SOURCEMAPS = 'ONLY_INLINE_SOURCEMAPS',
	PARSE_ERROR = 'PARSE_ERROR',
	PLUGIN_ERROR = 'PLUGIN_ERROR',
	PREFER_NAMED_EXPORTS = 'PREFER_NAMED_EXPORTS',
	SHIMMED_EXPORT = 'SHIMMED_EXPORT',
	SOURCEMAP_BROKEN = 'SOURCEMAP_BROKEN',
	SOURCEMAP_ERROR = 'SOURCEMAP_ERROR',
	SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT = 'SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT',
	THIS_IS_UNDEFINED = 'THIS_IS_UNDEFINED',
	TRANSPILED_ESM_CONFIG = 'TRANSPILED_ESM_CONFIG',
	UNEXPECTED_NAMED_IMPORT = 'UNEXPECTED_NAMED_IMPORT',
	UNKNOWN_OPTION = 'UNKNOWN_OPTION',
	UNRESOLVED_ENTRY = 'UNRESOLVED_ENTRY',
	UNRESOLVED_IMPORT = 'UNRESOLVED_IMPORT',
	UNUSED_EXTERNAL_IMPORT = 'UNUSED_EXTERNAL_IMPORT',
	VALIDATION_ERROR = 'VALIDATION_ERROR';

export function errAddonNotGenerated(message: string, hook: string, plugin: string): RollupLog {
	return {
		code: ADDON_ERROR,
		message: `Could not retrieve "${hook}". Check configuration of plugin "${plugin}".
\tError Message: ${message}`
	};
}

export function errAlreadyClosed(): RollupLog {
	return {
		code: ALREADY_CLOSED,
		message: 'Bundle is already closed, no more calls to "generate" or "write" are allowed.'
	};
}

export function errAmbiguousExternalNamespaces(
	binding: string,
	reexportingModule: string,
	usedModule: string,
	sources: string[]
): RollupLog {
	return {
		binding,
		code: AMBIGUOUS_EXTERNAL_NAMESPACES,
		ids: sources,
		message: `Ambiguous external namespace resolution: "${relativeId(
			reexportingModule
		)}" re-exports "${binding}" from one of the external modules ${printQuotedStringList(
			sources.map(module => relativeId(module))
		)}, guessing "${relativeId(usedModule)}".`,
		reexporter: reexportingModule
	};
}

export function errAnonymousPluginCache(): RollupLog {
	return {
		code: ANONYMOUS_PLUGIN_CACHE,
		message:
			'A plugin is trying to use the Rollup cache but is not declaring a plugin name or cacheKey.'
	};
}

export function errAssetNotFinalisedForFileName(name: string): RollupLog {
	return {
		code: ASSET_NOT_FINALISED,
		message: `Plugin error - Unable to get file name for asset "${name}". Ensure that the source is set and that generate is called first. If you reference assets via import.meta.ROLLUP_FILE_URL_<referenceId>, you need to either have set their source after "renderStart" or need to provide an explicit "fileName" when emitting them.`
	};
}

export function errAssetReferenceIdNotFoundForSetSource(assetReferenceId: string): RollupLog {
	return {
		code: ASSET_NOT_FOUND,
		message: `Plugin error - Unable to set the source for unknown asset "${assetReferenceId}".`
	};
}

export function errAssetSourceAlreadySet(name: string): RollupLog {
	return {
		code: ASSET_SOURCE_ALREADY_SET,
		message: `Unable to set the source for asset "${name}", source already set.`
	};
}

export function errNoAssetSourceSet(assetName: string): RollupLog {
	return {
		code: ASSET_SOURCE_MISSING,
		message: `Plugin error creating asset "${assetName}" - no asset source set.`
	};
}

export function errBadLoader(id: string): RollupLog {
	return {
		code: BAD_LOADER,
		message: `Error loading "${relativeId(
			id
		)}": plugin load hook should return a string, a { code, map } object, or nothing/null.`
	};
}

export function errCannotCallNamespace(name: string): RollupLog {
	return {
		code: CANNOT_CALL_NAMESPACE,
		message: `Cannot call a namespace ("${name}").`
	};
}

export function errCannotEmitFromOptionsHook(): RollupLog {
	return {
		code: CANNOT_EMIT_FROM_OPTIONS_HOOK,
		message: `Cannot emit files or set asset sources in the "outputOptions" hook, use the "renderStart" hook instead.`
	};
}

export function errChunkNotGeneratedForFileName(name: string): RollupLog {
	return {
		code: CHUNK_NOT_GENERATED,
		message: `Plugin error - Unable to get file name for emitted chunk "${name}". You can only get file names once chunks have been generated after the "renderStart" hook.`
	};
}

export function errChunkInvalid(
	{ fileName, code }: { code: string; fileName: string },
	exception: { loc: { column: number; line: number }; message: string }
): RollupLog {
	const errorProps = {
		code: CHUNK_INVALID,
		message: `Chunk "${fileName}" is not valid JavaScript: ${exception.message}.`
	};
	augmentCodeLocation(errorProps, exception.loc, code, fileName);
	return errorProps;
}

export function errCircularDependency(cyclePath: string[]): RollupLog {
	return {
		code: CIRCULAR_DEPENDENCY,
		ids: cyclePath,
		message: `Circular dependency: ${cyclePath.map(relativeId).join(' -> ')}`
	};
}

export function errCircularReexport(exportName: string, exporter: string): RollupLog {
	return {
		code: CIRCULAR_REEXPORT,
		exporter,
		message: `"${exportName}" cannot be exported from "${relativeId(
			exporter
		)}" as it is a reexport that references itself.`
	};
}

export function errCyclicCrossChunkReexport(
	exportName: string,
	exporter: string,
	reexporter: string,
	importer: string
): RollupLog {
	return {
		code: CYCLIC_CROSS_CHUNK_REEXPORT,
		exporter,
		id: importer,
		message: `Export "${exportName}" of module "${relativeId(
			exporter
		)}" was reexported through module "${relativeId(
			reexporter
		)}" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "${relativeId(
			importer
		)}" to point directly to the exporting module or do not use "preserveModules" to ensure these modules end up in the same chunk.`,
		reexporter
	};
}

export function errDeprecation(deprecation: string | RollupWarning): RollupLog {
	return {
		code: DEPRECATED_FEATURE,
		...(typeof deprecation === 'string' ? { message: deprecation } : deprecation)
	};
}

export function errDuplicateImportOptions(): RollupLog {
	return {
		code: DUPLICATE_IMPORT_OPTIONS,
		message: 'Either use --input, or pass input path as argument'
	};
}

export function errDuplicatePluginName(plugin: string): RollupLog {
	return {
		code: DUPLICATE_PLUGIN_NAME,
		message: `The plugin name ${plugin} is being used twice in the same build. Plugin names must be distinct or provide a cacheKey (please post an issue to the plugin if you are a plugin user).`
	};
}

export function errEmptyChunk(chunkName: string): RollupLog {
	return {
		code: EMPTY_BUNDLE,
		message: `Generated an empty chunk: "${chunkName}".`,
		names: [chunkName]
	};
}

export function errEval(id: string): RollupLog {
	return {
		code: EVAL,
		id,
		message: `Use of eval in "${relativeId(
			id
		)}" is strongly discouraged as it poses security risks and may cause issues with minification.`,
		url: 'https://rollupjs.org/guide/en/#avoiding-eval'
	};
}

export function errExternalSyntheticExports(id: string, importer: string): RollupLog {
	return {
		code: EXTERNAL_SYNTHETIC_EXPORTS,
		exporter: id,
		message: `External "${id}" cannot have "syntheticNamedExports" enabled (imported by "${relativeId(
			importer
		)}").`
	};
}

export function errFailAfterWarnings(): RollupLog {
	return {
		code: FAIL_AFTER_WARNINGS,
		message: 'Warnings occurred and --failAfterWarnings flag present.'
	};
}

export function errFileNameConflict(fileName: string): RollupLog {
	return {
		code: FILE_NAME_CONFLICT,
		message: `The emitted file "${fileName}" overwrites a previously emitted file of the same name.`
	};
}

export function errFileReferenceIdNotFoundForFilename(assetReferenceId: string): RollupLog {
	return {
		code: FILE_NOT_FOUND,
		message: `Plugin error - Unable to get file name for unknown file "${assetReferenceId}".`
	};
}

export function errIllegalIdentifierAsName(name: string): RollupLog {
	return {
		code: ILLEGAL_IDENTIFIER_AS_NAME,
		message: `Given name "${name}" is not a legal JS identifier. If you need this, you can try "output.extend: true".`,
		url: 'https://rollupjs.org/guide/en/#outputextend'
	};
}

export function errIllegalImportReassignment(name: string, importingId: string): RollupLog {
	return {
		code: ILLEGAL_REASSIGNMENT,
		message: `Illegal reassignment of import "${name}" in "${relativeId(importingId)}".`
	};
}

export function errInputHookInOutputPlugin(pluginName: string, hookName: string): RollupLog {
	return {
		code: INPUT_HOOK_IN_OUTPUT_PLUGIN,
		message: `The "${hookName}" hook used by the output plugin ${pluginName} is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.`
	};
}

export function errCannotAssignModuleToChunk(
	moduleId: string,
	assignToAlias: string,
	currentAlias: string
): RollupLog {
	return {
		code: INVALID_CHUNK,
		message: `Cannot assign "${relativeId(
			moduleId
		)}" to the "${assignToAlias}" chunk as it is already in the "${currentAlias}" chunk.`
	};
}

export function errInvalidExportOptionValue(optionValue: string): RollupLog {
	return {
		code: INVALID_EXPORT_OPTION,
		message: `"output.exports" must be "default", "named", "none", "auto", or left unspecified (defaults to "auto"), received "${optionValue}".`,
		url: `https://rollupjs.org/guide/en/#outputexports`
	};
}

export function errIncompatibleExportOptionValue(
	optionValue: string,
	keys: readonly string[],
	entryModule: string
): RollupLog {
	return {
		code: INVALID_EXPORT_OPTION,
		message: `"${optionValue}" was specified for "output.exports", but entry module "${relativeId(
			entryModule
		)}" has the following exports: ${printQuotedStringList(keys)}`,
		url: 'https://rollupjs.org/guide/en/#outputexports'
	};
}

export function errInternalIdCannotBeExternal(source: string, importer: string): RollupLog {
	return {
		code: INVALID_EXTERNAL_ID,
		message: `"${source}" is imported as an external by "${relativeId(
			importer
		)}", but is already an existing non-external module id.`
	};
}

export function errInvalidOption(
	option: string,
	urlHash: string,
	explanation: string,
	value?: string | boolean | null
): RollupLog {
	return {
		code: INVALID_OPTION,
		message: `Invalid value ${
			value !== undefined ? `${JSON.stringify(value)} ` : ''
		}for option "${option}" - ${explanation}.`,
		url: `https://rollupjs.org/guide/en/#${urlHash}`
	};
}

export function errInvalidAddonPluginHook(hook: string, plugin: string): RollupLog {
	return {
		code: INVALID_PLUGIN_HOOK,
		hook,
		message: `Error running plugin hook "${hook}" for plugin "${plugin}", expected a string, a function hook or an object with a "handler" string or function.`,
		plugin
	};
}

export function errInvalidFunctionPluginHook(hook: string, plugin: string): RollupLog {
	return {
		code: INVALID_PLUGIN_HOOK,
		hook,
		message: `Error running plugin hook "${hook}" for plugin "${plugin}", expected a function hook or an object with a "handler" function.`,
		plugin
	};
}

export function errInvalidRollupPhaseForAddWatchFile(): RollupLog {
	return {
		code: INVALID_ROLLUP_PHASE,
		message: `Cannot call "addWatchFile" after the build has finished.`
	};
}

export function errInvalidRollupPhaseForChunkEmission(): RollupLog {
	return {
		code: INVALID_ROLLUP_PHASE,
		message: `Cannot emit chunks after module loading has finished.`
	};
}

export function errInvalidSetAssetSourceCall(): RollupLog {
	return {
		code: INVALID_SETASSETSOURCE,
		message: `setAssetSource cannot be called in transform for caching reasons. Use emitFile with a source, or call setAssetSource in another hook.`
	};
}

export function errInvalidFormatForTopLevelAwait(
	id: string,
	format: InternalModuleFormat
): RollupLog {
	return {
		code: INVALID_TLA_FORMAT,
		id,
		message: `Module format "${format}" does not support top-level await. Use the "es" or "system" output formats rather.`
	};
}

export function errMissingConfig(): RollupLog {
	return {
		code: MISSING_CONFIG,
		message: 'Config file must export an options object, or an array of options objects',
		url: 'https://rollupjs.org/guide/en/#configuration-files'
	};
}

export function errMissingExport(
	binding: string,
	importingModule: string,
	exporter: string
): RollupLog {
	return {
		binding,
		code: MISSING_EXPORT,
		exporter,
		id: importingModule,
		message: `"${binding}" is not exported by "${relativeId(exporter)}", imported by "${relativeId(
			importingModule
		)}".`,
		url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module`
	};
}

export function errMissingExternalConfig(file: string): RollupLog {
	return {
		code: MISSING_EXTERNAL_CONFIG,
		message: `Could not resolve config file "${file}"`
	};
}

export function errMissingGlobalName(externalId: string, guess: string): RollupLog {
	return {
		code: MISSING_GLOBAL_NAME,
		id: externalId,
		message: `No name was provided for external module "${externalId}" in "output.globals" – guessing "${guess}".`,
		names: [guess],
		url: 'https://rollupjs.org/guide/en/#outputglobals'
	};
}

export function errImplicitDependantCannotBeExternal(
	unresolvedId: string,
	implicitlyLoadedBefore: string
): RollupLog {
	return {
		code: MISSING_IMPLICIT_DEPENDANT,
		message: `Module "${relativeId(
			unresolvedId
		)}" that should be implicitly loaded before "${relativeId(
			implicitlyLoadedBefore
		)}" cannot be external.`
	};
}

export function errUnresolvedImplicitDependant(
	unresolvedId: string,
	implicitlyLoadedBefore: string
): RollupLog {
	return {
		code: MISSING_IMPLICIT_DEPENDANT,
		message: `Module "${relativeId(
			unresolvedId
		)}" that should be implicitly loaded before "${relativeId(
			implicitlyLoadedBefore
		)}" could not be resolved.`
	};
}

export function errImplicitDependantIsNotIncluded(module: Module): RollupLog {
	const implicitDependencies = Array.from(module.implicitlyLoadedBefore, dependency =>
		relativeId(dependency.id)
	).sort();
	return {
		code: MISSING_IMPLICIT_DEPENDANT,
		message: `Module "${relativeId(
			module.id
		)}" that should be implicitly loaded before ${printQuotedStringList(
			implicitDependencies
		)} is not included in the module graph. Either it was not imported by an included module or only via a tree-shaken dynamic import, or no imported bindings were used and it had otherwise no side-effects.`
	};
}

export function errMissingNameOptionForIifeExport(): RollupLog {
	return {
		code: MISSING_NAME_OPTION_FOR_IIFE_EXPORT,
		message: `If you do not supply "output.name", you may not be able to access the exports of an IIFE bundle.`,
		url: 'https://rollupjs.org/guide/en/#outputname'
	};
}

export function errMissingNameOptionForUmdExport(): RollupLog {
	return {
		code: MISSING_NAME_OPTION_FOR_IIFE_EXPORT,
		message:
			'You must supply "output.name" for UMD bundles that have exports so that the exports are accessible in environments without a module loader.',
		url: 'https://rollupjs.org/guide/en/#outputname'
	};
}

export function errMissingNodeBuiltins(externalBuiltins: string[]): RollupLog {
	return {
		code: MISSING_NODE_BUILTINS,
		ids: externalBuiltins,
		message: `Creating a browser bundle that depends on Node.js built-in modules (${printQuotedStringList(
			externalBuiltins
		)}). You might need to include https://github.com/FredKSchott/rollup-plugin-polyfill-node`
	};
}

export function errMissingFileOrDirOption(): RollupLog {
	return {
		code: MISSING_OPTION,
		message: 'You must specify "output.file" or "output.dir" for the build.',
		url: 'https://rollupjs.org/guide/en/#outputdir'
	};
}

export function errMixedExport(facadeModuleId: string, name?: string): RollupLog {
	return {
		code: MIXED_EXPORTS,
		id: facadeModuleId,
		message: `Entry module "${relativeId(
			facadeModuleId
		)}" is using named and default exports together. Consumers of your bundle will have to use \`${
			name || 'chunk'
		}.default\` to access the default export, which may not be what you want. Use \`output.exports: "named"\` to disable this warning.`,
		url: `https://rollupjs.org/guide/en/#outputexports`
	};
}

export function errModuleLevelDirective(directive: string, id: string): RollupLog {
	return {
		code: MODULE_LEVEL_DIRECTIVE,
		id,
		message: `Module level directives cause errors when bundled, "${directive}" in "${relativeId(
			id
		)}" was ignored.`
	};
}

export function errNamespaceConflict(
	binding: string,
	reexportingModuleId: string,
	sources: string[]
): RollupLog {
	return {
		binding,
		code: NAMESPACE_CONFLICT,
		ids: sources,
		message: `Conflicting namespaces: "${relativeId(
			reexportingModuleId
		)}" re-exports "${binding}" from one of the modules ${printQuotedStringList(
			sources.map(moduleId => relativeId(moduleId))
		)} (will be ignored).`,
		reexporter: reexportingModuleId
	};
}

export function errNoFileSystemInBrowser(method: string): RollupLog {
	return {
		code: NO_FS_IN_BROWSER,
		message: `Cannot access the file system (via "${method}") when using the browser build of Rollup. Make sure you supply a plugin with custom resolveId and load hooks to Rollup.`,
		url: 'https://rollupjs.org/guide/en/#a-simple-example'
	};
}

export function errNoTransformMapOrAstWithoutCode(pluginName: string): RollupLog {
	return {
		code: NO_TRANSFORM_MAP_OR_AST_WITHOUT_CODE,
		message:
			`The plugin "${pluginName}" returned a "map" or "ast" without returning ` +
			'a "code". This will be ignored.'
	};
}

export function errOnlyInlineSourcemapsForStdout(): RollupLog {
	return {
		code: ONLY_INLINE_SOURCEMAPS,
		message: 'Only inline sourcemaps are supported when bundling to stdout.'
	};
}

export function errParseError(error: Error, moduleId: string): RollupLog {
	let message = error.message.replace(/ \(\d+:\d+\)$/, '');
	if (moduleId.endsWith('.json')) {
		message += ' (Note that you need @rollup/plugin-json to import JSON files)';
	} else if (!moduleId.endsWith('.js')) {
		message += ' (Note that you need plugins to import files that are not JavaScript)';
	}
	return {
		cause: error,
		code: PARSE_ERROR,
		id: moduleId,
		message
	};
}

export function errPluginError(
	error: string | RollupLog,
	plugin: string,
	{ hook, id }: { hook?: string; id?: string } = {}
): RollupLog {
	if (typeof error === 'string') error = { message: error };
	if (error.code && error.code !== PLUGIN_ERROR) {
		error.pluginCode = error.code;
	}
	error.code = PLUGIN_ERROR;
	error.plugin = plugin;
	if (hook) {
		error.hook = hook;
	}
	if (id) {
		error.id = id;
	}
	return error;
}

export function errPreferNamedExports(facadeModuleId: string): RollupLog {
	const file = relativeId(facadeModuleId);
	return {
		code: PREFER_NAMED_EXPORTS,
		id: facadeModuleId,
		message: `Entry module "${file}" is implicitly using "default" export mode, which means for CommonJS output that its default export is assigned to "module.exports". For many tools, such CommonJS output will not be interchangeable with the original ES module. If this is intended, explicitly set "output.exports" to either "auto" or "default", otherwise you might want to consider changing the signature of "${file}" to use named exports only.`,
		url: `https://rollupjs.org/guide/en/#outputexports`
	};
}

export function errShimmedExport(id: string, binding: string): RollupLog {
	return {
		binding,
		code: SHIMMED_EXPORT,
		exporter: id,
		message: `Missing export "${binding}" has been shimmed in module "${relativeId(id)}".`
	};
}

export function errSourcemapBroken(plugin: string): RollupLog {
	return {
		code: SOURCEMAP_BROKEN,
		message: `Sourcemap is likely to be incorrect: a plugin (${plugin}) was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help`,
		plugin,
		url: `https://rollupjs.org/guide/en/#warning-sourcemap-is-likely-to-be-incorrect`
	};
}

export function errInvalidSourcemapForError(
	error: Error,
	id: string,
	column: number,
	line: number,
	pos: number
): RollupLog {
	return {
		cause: error,
		code: SOURCEMAP_ERROR,
		id,
		loc: {
			column,
			file: id,
			line
		},
		message: `Error when using sourcemap for reporting an error: ${error.message}`,
		pos
	};
}

export function errSyntheticNamedExportsNeedNamespaceExport(
	id: string,
	syntheticNamedExportsOption: boolean | string
): RollupLog {
	return {
		code: SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT,
		exporter: id,
		message: `Module "${relativeId(
			id
		)}" that is marked with \`syntheticNamedExports: ${JSON.stringify(
			syntheticNamedExportsOption
		)}\` needs ${
			typeof syntheticNamedExportsOption === 'string' && syntheticNamedExportsOption !== 'default'
				? `an explicit export named "${syntheticNamedExportsOption}"`
				: 'a default export'
		} that does not reexport an unresolved named export of the same module.`
	};
}

export function errThisIsUndefined(): RollupLog {
	return {
		code: THIS_IS_UNDEFINED,
		message: `The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten`,
		url: `https://rollupjs.org/guide/en/#error-this-is-undefined`
	};
}

export function errTranspiledEsmConfig(fileName: string): RollupLog {
	return {
		code: TRANSPILED_ESM_CONFIG,
		message: `While loading the Rollup configuration from "${relativeId(
			fileName
		)}", Node tried to require an ES module from a CommonJS file, which is not supported. A common cause is if there is a package.json file with "type": "module" in the same folder. You can try to fix this by changing the extension of your configuration file to ".cjs" or ".mjs" depending on the content, which will prevent Rollup from trying to preprocess the file but rather hand it to Node directly.`
	};
}

export function errUnexpectedNamedImport(
	id: string,
	imported: string,
	isReexport: boolean
): RollupLog {
	const importType = isReexport ? 'reexport' : 'import';
	return {
		code: UNEXPECTED_NAMED_IMPORT,
		exporter: id,
		message: `The named export "${imported}" was ${importType}ed from the external module "${relativeId(
			id
		)}" even though its interop type is "defaultOnly". Either remove or change this ${importType} or change the value of the "output.interop" option.`,
		url: 'https://rollupjs.org/guide/en/#outputinterop'
	};
}

export function errUnexpectedNamespaceReexport(id: string): RollupLog {
	return {
		code: UNEXPECTED_NAMED_IMPORT,
		exporter: id,
		message: `There was a namespace "*" reexport from the external module "${relativeId(
			id
		)}" even though its interop type is "defaultOnly". This will be ignored as namespace reexports only reexport named exports. If this is not intended, either remove or change this reexport or change the value of the "output.interop" option.`,
		url: 'https://rollupjs.org/guide/en/#outputinterop'
	};
}

export function errUnknownOption(
	optionType: string,
	unknownOptions: string[],
	validOptions: string[]
): RollupLog {
	return {
		code: UNKNOWN_OPTION,
		message: `Unknown ${optionType}: ${unknownOptions.join(
			', '
		)}. Allowed options: ${validOptions.join(', ')}`
	};
}

export function errEntryCannotBeExternal(unresolvedId: string): RollupLog {
	return {
		code: UNRESOLVED_ENTRY,
		message: `Entry module "${relativeId(unresolvedId)}" cannot be external.`
	};
}

export function errUnresolvedEntry(unresolvedId: string): RollupLog {
	return {
		code: UNRESOLVED_ENTRY,
		message: `Could not resolve entry module "${relativeId(unresolvedId)}".`
	};
}

export function errUnresolvedImport(source: string, importer: string): RollupLog {
	return {
		code: UNRESOLVED_IMPORT,
		exporter: source,
		id: importer,
		message: `Could not resolve "${source}" from "${relativeId(importer)}"`
	};
}

export function errUnresolvedImportTreatedAsExternal(source: string, importer: string): RollupLog {
	return {
		code: UNRESOLVED_IMPORT,
		exporter: source,
		id: importer,
		message: `"${source}" is imported by "${relativeId(
			importer
		)}", but could not be resolved – treating it as an external dependency.`,
		url: 'https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency'
	};
}

export function errUnusedExternalImports(
	externalId: string,
	names: string[],
	importers: string[]
): RollupLog {
	return {
		code: UNUSED_EXTERNAL_IMPORT,
		exporter: externalId,
		ids: importers,
		message: `${printQuotedStringList(names, [
			'is',
			'are'
		])} imported from external module "${externalId}" but never used in ${printQuotedStringList(
			importers.map(importer => relativeId(importer))
		)}.`,
		names
	};
}

export function errFailedValidation(message: string): RollupLog {
	return {
		code: VALIDATION_ERROR,
		message
	};
}

export function warnDeprecation(
	deprecation: string | RollupWarning,
	activeDeprecation: boolean,
	options: NormalizedInputOptions
): void {
	warnDeprecationWithOptions(
		deprecation,
		activeDeprecation,
		options.onwarn,
		options.strictDeprecations
	);
}

export function warnDeprecationWithOptions(
	deprecation: string | RollupWarning,
	activeDeprecation: boolean,
	warn: WarningHandler,
	strictDeprecations: boolean
): void {
	if (activeDeprecation || strictDeprecations) {
		const warning = errDeprecation(deprecation);
		if (strictDeprecations) {
			return error(warning);
		}
		warn(warning);
	}
}
