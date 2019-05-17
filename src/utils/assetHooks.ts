import sha256 from 'hash.js/lib/hash/sha/256';
import { Asset, EmitAsset, OutputBundle } from '../rollup/types';
import {
	errAssetNotFinalisedForFileName,
	errAssetReferenceIdNotFoundForFilename,
	errAssetReferenceIdNotFoundForSetSource,
	errAssetSourceAlreadySet,
	errAssetSourceMissingForSetSource,
	errInvalidAssetName,
	errNoAssetSourceSet,
	error
} from './error';
import { extname } from './path';
import { addWithNewReferenceId } from './referenceIds';
import { isPlainName } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';

export function getAssetFileName(
	asset: Asset,
	existingNames: Record<string, any>,
	assetFileNames: string
) {
	if (asset.source === undefined) error(errNoAssetSourceSet(asset));
	if (asset.fileName) return asset.fileName;

	return makeUnique(
		renderNamePattern(assetFileNames, 'assetFileNames', name => {
			switch (name) {
				case 'hash':
					const hash = sha256();
					hash.update(name);
					hash.update(':');
					hash.update(asset.source);
					return hash.digest('hex').substr(0, 8);
				case 'name':
					return asset.name.substr(0, asset.name.length - extname(asset.name).length);
				case 'extname':
					return extname(asset.name);
				case 'ext':
					return extname(asset.name).substr(1);
			}
			return undefined as any;
		}),
		existingNames
	);
}

export function createAssetPluginHooks(
	assetsByReferenceId: Map<string, Asset>,
	outputBundle?: OutputBundle,
	assetFileNames?: string
) {
	return {
		emitAsset(name: string, source?: string | Buffer) {
			if (typeof name !== 'string' || !isPlainName(name)) error(errInvalidAssetName(name));
			const asset: Asset = { name, source: source as string | Buffer, fileName: undefined as any };
			if (outputBundle && source !== undefined)
				finaliseAsset(asset, outputBundle, assetFileNames as string);
			return addWithNewReferenceId(asset, assetsByReferenceId, name);
		},

		setAssetSource(assetReferenceId: string, source?: string | Buffer) {
			const asset = assetsByReferenceId.get(assetReferenceId);
			if (!asset) return error(errAssetReferenceIdNotFoundForSetSource(assetReferenceId));
			if (asset.source !== undefined) return error(errAssetSourceAlreadySet(asset));
			if (typeof source !== 'string' && !source)
				return error(errAssetSourceMissingForSetSource(asset));
			asset.source = source;
			if (outputBundle) finaliseAsset(asset, outputBundle, assetFileNames as string);
		},

		getAssetFileName(assetReferenceId: string) {
			const asset = assetsByReferenceId.get(assetReferenceId);
			if (!asset) return error(errAssetReferenceIdNotFoundForFilename(assetReferenceId));
			if ((asset).fileName === undefined)
				return error(errAssetNotFinalisedForFileName(asset));
			return (asset).fileName;
		}
	};
}

export function finaliseAsset(asset: Asset, outputBundle: OutputBundle, assetFileNames: string) {
	const fileName = getAssetFileName(asset, outputBundle, assetFileNames);
	asset.fileName = fileName;
	outputBundle[fileName] = {
		fileName,
		isAsset: true,
		source: asset.source
	};
}

export function createTransformEmitAsset(
	assetsByReferenceId: Map<string, Asset>,
	emitAsset: EmitAsset
) {
	const assets: Asset[] = [];
	return {
		assets,
		emitAsset: (name: string, source?: string | Buffer) => {
			const assetReferenceId = emitAsset(name, source);
			const asset = assetsByReferenceId.get(assetReferenceId) as Asset;
			assets.push({
				fileName: undefined as any,
				name: asset.name,
				source: asset.source
			});
			return assetReferenceId;
		}
	};
}
