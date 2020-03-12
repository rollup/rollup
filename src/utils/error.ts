import { locate } from 'locate-character';
import Module from '../Module';
import { RollupError, RollupWarning } from '../rollup/types';
import getCodeFrame from './getCodeFrame';
import relativeId from './relativeId';

export function error(base: Error | RollupError): never {
	if (!(base instanceof Error)) base = Object.assign(new Error(base.message), base);
	throw base;
}

export function augmentCodeLocation(
	object: RollupError | RollupWarning,
	pos: number | { column: number; line: number },
	source: string,
	id: string
): void {
	if (typeof pos === 'object') {
		const { line, column } = pos;
		object.loc = { file: id, line, column };
	} else {
		object.pos = pos;
		const { line, column } = locate(source, pos, { offsetLine: 1 });
		object.loc = { file: id, line, column };
	}

	if (object.frame === undefined) {
		const { line, column } = object.loc;
		object.frame = getCodeFrame(source, line, column);
	}
}

export enum Errors {
	ASSET_NOT_FINALISED = 'ASSET_NOT_FINALISED',
	ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
	ASSET_SOURCE_ALREADY_SET = 'ASSET_SOURCE_ALREADY_SET',
	ASSET_SOURCE_MISSING = 'ASSET_SOURCE_MISSING',
	BAD_LOADER = 'BAD_LOADER',
	CANNOT_EMIT_FROM_OPTIONS_HOOK = 'CANNOT_EMIT_FROM_OPTIONS_HOOK',
	CHUNK_NOT_GENERATED = 'CHUNK_NOT_GENERATED',
	DEPRECATED_FEATURE = 'DEPRECATED_FEATURE',
	FILE_NOT_FOUND = 'FILE_NOT_FOUND',
	FILE_NAME_CONFLICT = 'FILE_NAME_CONFLICT',
	INPUT_HOOK_IN_OUTPUT_PLUGIN = 'INPUT_HOOK_IN_OUTPUT_PLUGIN',
	INVALID_CHUNK = 'INVALID_CHUNK',
	INVALID_EXPORT_OPTION = 'INVALID_EXPORT_OPTION',
	INVALID_EXTERNAL_ID = 'INVALID_EXTERNAL_ID',
	INVALID_OPTION = 'INVALID_OPTION',
	INVALID_PLUGIN_HOOK = 'INVALID_PLUGIN_HOOK',
	INVALID_ROLLUP_PHASE = 'INVALID_ROLLUP_PHASE',
	MIXED_EXPORTS = 'MIXED_EXPORTS',
	NAMESPACE_CONFLICT = 'NAMESPACE_CONFLICT',
	PLUGIN_ERROR = 'PLUGIN_ERROR',
	UNRESOLVED_ENTRY = 'UNRESOLVED_ENTRY',
	UNRESOLVED_IMPORT = 'UNRESOLVED_IMPORT',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	EXTERNAL_SYNTHETIC_EXPORTS = 'EXTERNAL_SYNTHETIC_EXPORTS',
	SYNTHETIC_NAMED_EXPORTS_NEED_DEFAULT = 'SYNTHETIC_NAMED_EXPORTS_NEED_DEFAULT'
}

export function errAssetNotFinalisedForFileName(name: string) {
	return {
		code: Errors.ASSET_NOT_FINALISED,
		message: `Plugin error - Unable to get file name for asset "${name}". Ensure that the source is set and that generate is called first.`
	};
}

export function errCannotEmitFromOptionsHook() {
	return {
		code: Errors.CANNOT_EMIT_FROM_OPTIONS_HOOK,
		message: `Cannot emit files or set asset sources in the "outputOptions" hook, use the "renderStart" hook instead.`
	};
}

export function errChunkNotGeneratedForFileName(name: string) {
	return {
		code: Errors.CHUNK_NOT_GENERATED,
		message: `Plugin error - Unable to get file name for chunk "${name}". Ensure that generate is called first.`
	};
}

export function errAssetReferenceIdNotFoundForSetSource(assetReferenceId: string) {
	return {
		code: Errors.ASSET_NOT_FOUND,
		message: `Plugin error - Unable to set the source for unknown asset "${assetReferenceId}".`
	};
}

export function errAssetSourceAlreadySet(name: string) {
	return {
		code: Errors.ASSET_SOURCE_ALREADY_SET,
		message: `Unable to set the source for asset "${name}", source already set.`
	};
}

export function errNoAssetSourceSet(assetName: string) {
	return {
		code: Errors.ASSET_SOURCE_MISSING,
		message: `Plugin error creating asset "${assetName}" - no asset source set.`
	};
}

export function errBadLoader(id: string) {
	return {
		code: Errors.BAD_LOADER,
		message: `Error loading ${relativeId(
			id
		)}: plugin load hook should return a string, a { code, map } object, or nothing/null`
	};
}

export function errDeprecation(deprecation: string | RollupWarning) {
	return {
		code: Errors.DEPRECATED_FEATURE,
		...(typeof deprecation === 'string' ? { message: deprecation } : deprecation)
	};
}

export function errFileReferenceIdNotFoundForFilename(assetReferenceId: string) {
	return {
		code: Errors.FILE_NOT_FOUND,
		message: `Plugin error - Unable to get file name for unknown file "${assetReferenceId}".`
	};
}

export function errFileNameConflict(fileName: string) {
	return {
		code: Errors.FILE_NAME_CONFLICT,
		message: `The emitted file "${fileName}" overwrites a previously emitted file of the same name.`
	};
}

export function errInputHookInOutputPlugin(pluginName: string, hookName: string) {
	return {
		code: Errors.INPUT_HOOK_IN_OUTPUT_PLUGIN,
		message: `The "${hookName}" hook used by the output plugin ${pluginName} is a build time hook and will not be run for that plugin. Either this plugin cannot be used as an output plugin, or it should have an option to configure it as an output plugin.`
	};
}

export function errCannotAssignModuleToChunk(
	moduleId: string,
	assignToAlias: string,
	currentAlias: string
) {
	return {
		code: Errors.INVALID_CHUNK,
		message: `Cannot assign ${relativeId(
			moduleId
		)} to the "${assignToAlias}" chunk as it is already in the "${currentAlias}" chunk.`
	};
}

export function errInvalidExportOptionValue(optionValue: string) {
	return {
		code: Errors.INVALID_EXPORT_OPTION,
		message: `"output.exports" must be "default", "named", "none", "auto", or left unspecified (defaults to "auto"), received "${optionValue}"`,
		url: `https://rollupjs.org/guide/en/#output-exports`
	};
}

export function errIncompatibleExportOptionValue(
	optionValue: string,
	keys: string[],
	entryModule: string
) {
	return {
		code: 'INVALID_EXPORT_OPTION',
		message: `"${optionValue}" was specified for "output.exports", but entry module "${relativeId(
			entryModule
		)}" has the following exports: ${keys.join(', ')}`
	};
}

export function errInternalIdCannotBeExternal(source: string, importer: string) {
	return {
		code: Errors.INVALID_EXTERNAL_ID,
		message: `'${source}' is imported as an external by ${relativeId(
			importer
		)}, but is already an existing non-external module id.`
	};
}

export function errInvalidOption(option: string, explanation: string) {
	return {
		code: Errors.INVALID_OPTION,
		message: `Invalid value for option "${option}" - ${explanation}.`
	};
}

export function errInvalidRollupPhaseForAddWatchFile() {
	return {
		code: Errors.INVALID_ROLLUP_PHASE,
		message: `Cannot call addWatchFile after the build has finished.`
	};
}

export function errInvalidRollupPhaseForChunkEmission() {
	return {
		code: Errors.INVALID_ROLLUP_PHASE,
		message: `Cannot emit chunks after module loading has finished.`
	};
}

export function errMixedExport(facadeModuleId: string, name?: string) {
	return {
		code: Errors.MIXED_EXPORTS,
		id: facadeModuleId,
		message: `Entry module "${relativeId(
			facadeModuleId
		)}" is using named and default exports together. Consumers of your bundle will have to use \`${name ||
			'chunk'}["default"]\` to access the default export, which may not be what you want. Use \`output.exports: "named"\` to disable this warning`,
		url: `https://rollupjs.org/guide/en/#output-exports`
	};
}

export function errNamespaceConflict(
	name: string,
	reexportingModule: Module,
	additionalExportAllModule: Module
) {
	return {
		code: Errors.NAMESPACE_CONFLICT,
		message: `Conflicting namespaces: ${relativeId(
			reexportingModule.id
		)} re-exports '${name}' from both ${relativeId(
			reexportingModule.exportsAll[name]
		)} and ${relativeId(additionalExportAllModule.exportsAll[name])} (will be ignored)`,
		name,
		reexporter: reexportingModule.id,
		sources: [reexportingModule.exportsAll[name], additionalExportAllModule.exportsAll[name]]
	};
}

export function errEntryCannotBeExternal(unresolvedId: string) {
	return {
		code: Errors.UNRESOLVED_ENTRY,
		message: `Entry module cannot be external (${relativeId(unresolvedId)}).`
	};
}

export function errUnresolvedEntry(unresolvedId: string) {
	return {
		code: Errors.UNRESOLVED_ENTRY,
		message: `Could not resolve entry module (${relativeId(unresolvedId)}).`
	};
}

export function errUnresolvedImport(source: string, importer: string) {
	return {
		code: Errors.UNRESOLVED_IMPORT,
		message: `Could not resolve '${source}' from ${relativeId(importer)}`
	};
}

export function errUnresolvedImportTreatedAsExternal(source: string, importer: string) {
	return {
		code: Errors.UNRESOLVED_IMPORT,
		importer: relativeId(importer),
		message: `'${source}' is imported by ${relativeId(
			importer
		)}, but could not be resolved – treating it as an external dependency`,
		source,
		url: 'https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency'
	};
}

export function errExternalSyntheticExports(source: string, importer: string) {
	return {
		code: Errors.EXTERNAL_SYNTHETIC_EXPORTS,
		importer: relativeId(importer),
		message: `External '${source}' can not have 'syntheticNamedExports' enabled.`,
		source
	};
}

export function errFailedValidation(message: string) {
	return {
		code: Errors.VALIDATION_ERROR,
		message
	};
}
