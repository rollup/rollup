import { Asset, EmittedFile } from '../rollup/types';
import {
	errAssetNotFinalisedForFileName,
	errAssetReferenceIdNotFoundForFilename,
	errAssetReferenceIdNotFoundForSetSource,
	errAssetSourceAlreadySet,
	errAssetSourceMissingForSetSource,
	errInvalidAssetName,
	error
} from './error';
import { addWithNewReferenceId } from './referenceIds';
import { isPlainName } from './relativeId';

export class FileEmitter {
	private assetsByReferenceId: Map<string, Asset>;

	constructor(assetsByReferenceId: Map<string, Asset>) {
		this.assetsByReferenceId = assetsByReferenceId;
	}

	public emitFile = (emittedFile: EmittedFile): string => {
		if (emittedFile.type !== 'asset') {
			throw new Error(`Unhandlded file type ${emittedFile.type}`);
		}
		const { name, source } = emittedFile;
		if (typeof name !== 'string' || !isPlainName(name)) error(errInvalidAssetName(name));
		const asset: Asset = { name, source: source as string | Buffer, fileName: undefined as any };
		return addWithNewReferenceId(asset, this.assetsByReferenceId, name);
	};

	public getFileName = (fileReferenceId: string) => {
		const asset = this.assetsByReferenceId.get(fileReferenceId);
		if (!asset) return error(errAssetReferenceIdNotFoundForFilename(fileReferenceId));
		if (asset.fileName === undefined) return error(errAssetNotFinalisedForFileName(asset));
		return asset.fileName;
	};

	public setFileSource = (fileReferenceId: string, source?: string | Buffer) => {
		const asset = this.assetsByReferenceId.get(fileReferenceId);
		if (!asset) return error(errAssetReferenceIdNotFoundForSetSource(fileReferenceId));
		if (asset.source !== undefined) return error(errAssetSourceAlreadySet(asset));
		if (typeof source !== 'string' && !source)
			return error(errAssetSourceMissingForSetSource(asset));
		asset.source = source;
	};
}
