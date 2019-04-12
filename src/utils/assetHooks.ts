import sha256 from 'hash.js/lib/hash/sha/256';
import { Asset, EmitAsset, OutputBundle } from '../rollup/types';
import { error } from './error';
import { addWithNewMetaId } from './metaIds';
import { extname } from './path';
import { isPlainName } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';

export function getAssetFileName(
	asset: Asset,
	existingNames: Record<string, any>,
	assetFileNames: string
) {
	if (asset.source === undefined)
		error({
			code: 'ASSET_SOURCE_NOT_FOUND',
			message: `Plugin error creating asset ${asset.name} - no asset source set.`
		});

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
		}),
		existingNames
	);
}

export function createAssetPluginHooks(
	assetsByMetaId: Map<string, Asset>,
	outputBundle?: OutputBundle,
	assetFileNames?: string
) {
	return {
		emitAsset(name: string, source?: string | Buffer) {
			if (typeof name !== 'string' || !isPlainName(name))
				error({
					code: 'INVALID_ASSET_NAME',
					message: `Plugin error creating asset, name is not a plain (non relative or absolute URL) string name.`
				});
			const asset: Asset = { name, source, fileName: undefined };
			if (outputBundle && source !== undefined) finaliseAsset(asset, outputBundle, assetFileNames);
			return addWithNewMetaId(asset, assetsByMetaId, name);
		},
		setAssetSource(assetMetaId: string, source?: string | Buffer) {
			const asset = assetsByMetaId.get(assetMetaId);
			if (!asset)
				error({
					code: 'ASSET_NOT_FOUND',
					message: `Plugin error - Unable to set asset source for unknown asset ${assetMetaId}.`
				});
			if (asset.source !== undefined)
				error({
					code: 'ASSET_SOURCE_ALREADY_SET',
					message: `Plugin error - Unable to set asset source for ${
						asset.name
					}, source already set.`
				});
			if (typeof source !== 'string' && !source)
				error({
					code: 'ASSET_SOURCE_MISSING',
					message: `Plugin error creating asset ${name}, setAssetSource call without a source.`
				});
			asset.source = source;
			if (outputBundle) finaliseAsset(asset, outputBundle, assetFileNames);
		},
		// TODO Lukas we also need this for chunks. Can this be shared?
		getAssetFileName(assetMetaId: string) {
			const asset = assetsByMetaId.get(assetMetaId);
			if (!asset)
				error({
					code: 'ASSET_NOT_FOUND',
					message: `Plugin error - Unable to get asset filename for unknown asset ${assetMetaId}.`
				});
			if (asset.fileName === undefined)
				error({
					code: 'ASSET_NOT_FINALISED',
					message: `Plugin error - Unable to get asset file name for asset ${assetMetaId}. Ensure that the source is set and that generate is called first.`
				});
			return asset.fileName;
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

export function createTransformEmitAsset(assetsById: Map<string, Asset>, emitAsset: EmitAsset) {
	const assets: Asset[] = [];
	return {
		assets,
		emitAsset: (name: string, source?: string | Buffer) => {
			const assetMetaId = emitAsset(name, source);
			const asset = assetsById.get(assetMetaId);
			// distinguish transform assets
			assets.push({
				fileName: undefined,
				name: asset.name,
				source: asset.source
			});
			return assetMetaId;
		}
	};
}
