import sha256 from 'hash.js/lib/hash/sha/256';
import { Asset, EmittedFile, OutputBundle } from '../rollup/types';
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

// TODO Lukas setFileSource in transform needs to be repeated as well
interface OutputSpecificAssetData {
	assetFileNames: string;
	bundle: OutputBundle;
}

function getAssetFileName(
	name: string,
	source: string | Buffer,
	output: OutputSpecificAssetData
): string {
	return makeUnique(
		renderNamePattern(output.assetFileNames, 'assetFileNames', placeholder => {
			switch (placeholder) {
				case 'hash':
					const hash = sha256();
					hash.update(name);
					hash.update(':');
					hash.update(source);
					return hash.digest('hex').substr(0, 8);
				case 'name':
					return name.substr(0, name.length - extname(name).length);
				case 'extname':
					return extname(name);
				case 'ext':
					return extname(name).substr(1);
			}
			// TODO Lukas test
			return placeholder;
		}),
		output.bundle
	);
}

function addAssetToBundle(asset: Asset, output: OutputSpecificAssetData) {
	const fileName = getAssetFileName(asset.name, asset.source, output);
	asset.fileName = fileName;
	output.bundle[fileName] = {
		fileName,
		isAsset: true,
		source: asset.source
	};
}

// TODO Lukas general assumption: Having a source means having a reliable filename
// TODO Lukas only access filename during generate? Or disallow setSource if there is a fileName?
export class FileEmitter {
	// TODO Lukas change everything to files instead of assets
	private assetsByReferenceId: Map<string, Asset> = new Map<string, Asset>();
	private buildAssetsByReferenceId = this.assetsByReferenceId;
	private output: OutputSpecificAssetData | null = null;

	public emitFile = (emittedFile: EmittedFile): string => {
		if (emittedFile.type !== 'asset') {
			throw new Error(`Unhandled file type ${emittedFile.type}`);
		}
		const { name, source } = emittedFile;
		if (typeof name !== 'string' || !isPlainName(name)) {
			return error(errInvalidAssetName(name as any));
		}
		// TODO Lukas allow fileName to be undefined or null in type
		const asset: Asset = { name, source: source as string | Buffer, fileName: undefined as any };
		if (this.output && source !== undefined) {
			addAssetToBundle(asset, this.output);
		}
		return addWithNewReferenceId(asset, this.assetsByReferenceId, name);
	};

	public finaliseAssets() {
		for (const asset of this.assetsByReferenceId.values()) {
			if (asset.source === undefined) error(errNoAssetSourceSet(asset.name));
		}
	}

	public getFileName = (fileReferenceId: string) => {
		const asset = this.assetsByReferenceId.get(fileReferenceId);
		if (!asset) return error(errAssetReferenceIdNotFoundForFilename(fileReferenceId));
		// TODO Lukas error: source not set for filename
		if (asset.source === undefined) return error(errAssetNotFinalisedForFileName(asset));
		return asset.fileName;
	};

	public setFileSource = (fileReferenceId: string, source?: string | Buffer) => {
		const asset = this.assetsByReferenceId.get(fileReferenceId);
		if (!asset) return error(errAssetReferenceIdNotFoundForSetSource(fileReferenceId));
		// TODO Lukas can we allow this as long as output is not set?
		if (asset.source !== undefined) return error(errAssetSourceAlreadySet(asset));
		// TODO Lukas check for string | Buffer instead?
		if (typeof source !== 'string' && !source) {
			return error(errAssetSourceMissingForSetSource(asset));
		}
		if (this.output) {
			// We must not modify the original assets to not interact with other outputs
			const assetWithSource = { ...asset, source };
			this.assetsByReferenceId.set(fileReferenceId, assetWithSource);
			addAssetToBundle(assetWithSource, this.output);
		} else {
			asset.source = source;
		}
	};

	// TODO Lukas how do we unfinalize assets for different outputs that have their source set during generate? Test!
	public startOutput(outputBundle: OutputBundle, assetFileNames: string) {
		(this.assetsByReferenceId = new Map(this.buildAssetsByReferenceId)),
			(this.output = {
				assetFileNames,
				bundle: outputBundle
			});
		for (const asset of this.assetsByReferenceId.values()) {
			if (asset.source !== undefined) {
				addAssetToBundle(asset, this.output);
			}
		}
	}
}
