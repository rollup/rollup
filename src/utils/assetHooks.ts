import sha256 from 'hash.js/lib/hash/sha/256';
import { Asset, OutputBundle } from '../rollup/types';
import { error } from './error';
import { extname } from './path';
import { isPlainName } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';

export type EmitAsset = (name: string, source?: string | Buffer) => string;

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
			return undefined as any;
		}),
		existingNames
	);
}

export function createAssetPluginHooks(
	assetsById: Map<string, Asset>,
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

			let assetId: string = undefined as any;
			do {
				const assetHash = sha256();
				if (assetId) {
					// if there is a collision, chain until there isn't
					assetHash.update(assetId);
				} else {
					assetHash.update(name);
				}
				assetId = assetHash.digest('hex').substr(0, 8);
			} while (assetsById.has(assetId));

			const asset: Asset = { name, source: source as any, fileName: undefined as any };
			if (outputBundle && source !== undefined)
				finaliseAsset(asset, outputBundle, assetFileNames as string);
			assetsById.set(assetId, asset);
			return assetId;
		},
		setAssetSource(assetId: string, source?: string | Buffer) {
			const asset = assetsById.get(assetId);
			if (!asset)
				error({
					code: 'ASSET_NOT_FOUND',
					message: `Plugin error - Unable to set asset source for unknown asset ${assetId}.`
				});
			if ((asset as Asset).source !== undefined)
				error({
					code: 'ASSET_SOURCE_ALREADY_SET',
					message: `Plugin error - Unable to set asset source for ${
						(asset as Asset).name
					}, source already set.`
				});
			if (typeof source !== 'string' && !source)
				error({
					code: 'ASSET_SOURCE_MISSING',
					message: `Plugin error creating asset ${name}, setAssetSource call without a source.`
				});
			(asset as Asset).source = source as string | Buffer;
			if (outputBundle) finaliseAsset(asset as Asset, outputBundle, assetFileNames as string);
		},
		getAssetFileName(assetId: string) {
			const asset = assetsById.get(assetId);
			if (!asset)
				error({
					code: 'ASSET_NOT_FOUND',
					message: `Plugin error - Unable to get asset filename for unknown asset ${assetId}.`
				});
			if ((asset as Asset).fileName === undefined)
				error({
					code: 'ASSET_NOT_FINALISED',
					message: `Plugin error - Unable to get asset file name for asset ${assetId}. Ensure that the source is set and that generate is called first.`
				});
			return (asset as Asset).fileName;
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
			const assetId = emitAsset(name, source);
			const asset = assetsById.get(assetId) as Asset;
			// distinguish transform assets
			assets.push({
				fileName: undefined as any,
				name: asset.name,
				source: asset.source
			});
			return assetId;
		}
	};
}
