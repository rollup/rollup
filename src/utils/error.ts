import { locate } from 'locate-character';
import Module from '../Module';
import { Asset, RollupError, RollupWarning } from '../rollup/types';
import getCodeFrame from './getCodeFrame';
import relativeId from './relativeId';

export function error(base: Error | RollupError, props?: RollupError): never {
	if (base instanceof Error === false) base = Object.assign(new Error(base.message), base);
	if (props) Object.assign(base, props);
	throw base;
}

export function augmentCodeLocation(
	object: RollupError | RollupWarning,
	pos: { column: number; line: number },
	source: string,
	id: string
): void {
	if (pos.line !== undefined && pos.column !== undefined) {
		const { line, column } = pos;
		object.loc = { file: id, line, column };
	} else {
		object.pos = pos as any;
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
	CHUNK_NOT_FOUND = 'CHUNK_NOT_FOUND',
	CHUNK_NOT_GENERATED = 'CHUNK_NOT_GENERATED',
	DEPRECATED_FEATURE = 'DEPRECATED_FEATURE',
	INVALID_ASSET_NAME = 'INVALID_ASSET_NAME',
	INVALID_CHUNK = 'INVALID_CHUNK',
	INVALID_EXTERNAL_ID = 'INVALID_EXTERNAL_ID',
	INVALID_OPTION = 'INVALID_OPTION',
	INVALID_PLUGIN_HOOK = 'INVALID_PLUGIN_HOOK',
	INVALID_ROLLUP_PHASE = 'INVALID_ROLLUP_PHASE',
	NAMESPACE_CONFLICT = 'NAMESPACE_CONFLICT',
	UNRESOLVED_ENTRY = 'UNRESOLVED_ENTRY',
	UNRESOLVED_IMPORT = 'UNRESOLVED_IMPORT'
}

export function errAssetNotFinalisedForFileName(asset: Asset) {
	return {
		code: Errors.ASSET_NOT_FINALISED,
		message: `Plugin error - Unable to get file name for asset "${asset.name}". Ensure that the source is set and that generate is called first.`
	};
}

export function errChunkNotGeneratedForFileName(entry: { name: string }) {
	return {
		code: Errors.CHUNK_NOT_GENERATED,
		message: `Plugin error - Unable to get file name for chunk "${entry.name}". Ensure that generate is called first.`
	};
}

export function errAssetReferenceIdNotFoundForFilename(assetReferenceId: string) {
	return {
		code: Errors.ASSET_NOT_FOUND,
		message: `Plugin error - Unable to get file name for unknown asset "${assetReferenceId}".`
	};
}

export function errAssetReferenceIdNotFoundForSetSource(assetReferenceId: string) {
	return {
		code: Errors.ASSET_NOT_FOUND,
		message: `Plugin error - Unable to set the source for unknown asset "${assetReferenceId}".`
	};
}

export function errAssetSourceAlreadySet(asset: Asset) {
	return {
		code: Errors.ASSET_SOURCE_ALREADY_SET,
		message: `Plugin error - Unable to set the source for asset "${asset.name}", source already set.`
	};
}

export function errAssetSourceMissingForSetSource(asset: Asset) {
	return {
		code: Errors.ASSET_SOURCE_MISSING,
		message: `Plugin error creating asset "${asset.name}", setAssetSource call without a source.`
	};
}

export function errNoAssetSourceSet(asset: Asset) {
	return {
		code: Errors.ASSET_SOURCE_MISSING,
		message: `Plugin error creating asset "${asset.name}" - no asset source set.`
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

export function errChunkReferenceIdNotFoundForFilename(chunkReferenceId: string) {
	return {
		code: Errors.CHUNK_NOT_FOUND,
		message: `Plugin error - Unable to get file name for unknown chunk "${chunkReferenceId}".`
	};
}

export function errDeprecation(deprecation: string | RollupWarning) {
	return {
		code: Errors.DEPRECATED_FEATURE,
		...(typeof deprecation === 'string' ? { message: deprecation } : deprecation)
	};
}

export function errInvalidAssetName(name: string) {
	return {
		code: Errors.INVALID_ASSET_NAME,
		message: `Plugin error creating asset, name "${name}" is not a plain (non relative or absolute URL) string name.`
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

export function errInvalidRollupPhaseForEmitChunk() {
	return {
		code: Errors.INVALID_ROLLUP_PHASE,
		message: `Cannot call emitChunk after module loading has finished.`
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
		url: 'https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency'
	};
}
