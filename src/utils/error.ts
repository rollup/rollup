import { locate } from 'locate-character';
import { Asset, RollupError, RollupWarning } from '../rollup/types';
import getCodeFrame from './getCodeFrame';
import relativeId from './relativeId';

export function error(base: Error | RollupError, props?: RollupError) {
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
		object.pos = <any>pos;
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
	CHUNK_NOT_FOUND = 'CHUNK_NOT_FOUND',
	CHUNK_NOT_GENERATED = 'CHUNK_NOT_GENERATED',
	INVALID_ASSET_NAME = 'INVALID_ASSET_NAME',
	INVALID_CHUNK = 'INVALID_CHUNK',
	INVALID_ROLLUP_PHASE = 'INVALID_ROLLUP_PHASE'
}

export function errorAssetNotFinalisedForFileName(asset: Asset) {
	error({
		code: Errors.ASSET_NOT_FINALISED,
		message: `Plugin error - Unable to get file name for asset "${
			asset.name
		}". Ensure that the source is set and that generate is called first.`
	});
}

export function errorChunkNotGeneratedForFileName(entry: { name: string }) {
	error({
		code: Errors.CHUNK_NOT_GENERATED,
		message: `Plugin error - Unable to get file name for chunk "${
			entry.name
		}". Ensure that generate is called first.`
	});
}

export function errorAssetReferenceIdNotFoundForFilename(assetReferenceId: string) {
	error({
		code: Errors.ASSET_NOT_FOUND,
		message: `Plugin error - Unable to get file name for unknown asset "${assetReferenceId}".`
	});
}

export function errorAssetReferenceIdNotFoundForSetSource(assetReferenceId: string) {
	error({
		code: Errors.ASSET_NOT_FOUND,
		message: `Plugin error - Unable to set the source for unknown asset "${assetReferenceId}".`
	});
}

export function errorAssetSourceAlreadySet(asset: Asset) {
	error({
		code: Errors.ASSET_SOURCE_ALREADY_SET,
		message: `Plugin error - Unable to set the source for asset "${
			asset.name
		}", source already set.`
	});
}

export function errorAssetSourceMissingForSetSource(asset: Asset) {
	error({
		code: Errors.ASSET_SOURCE_MISSING,
		message: `Plugin error creating asset "${asset.name}", setAssetSource call without a source.`
	});
}

export function errorNoAssetSourceSet(asset: Asset) {
	error({
		code: Errors.ASSET_SOURCE_MISSING,
		message: `Plugin error creating asset "${asset.name}" - no asset source set.`
	});
}

export function errorChunkReferenceIdNotFoundForFilename(chunkReferenceId: string) {
	error({
		code: Errors.CHUNK_NOT_FOUND,
		message: `Plugin error - Unable to get file name for unknown chunk "${chunkReferenceId}".`
	});
}

export function errorInvalidAssetName(name: string) {
	error({
		code: Errors.INVALID_ASSET_NAME,
		message: `Plugin error creating asset, name "${name}" is not a plain (non relative or absolute URL) string name.`
	});
}

export function errorCannotAssignModuleToChunk(
	moduleId: string,
	assignToAlias: string,
	currentAlias: string
) {
	error({
		code: Errors.INVALID_CHUNK,
		message: `Cannot assign ${relativeId(
			moduleId
		)} to the "${assignToAlias}" chunk as it is already in the "${currentAlias}" chunk.`
	});
}
