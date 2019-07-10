import sha256 from 'hash.js/lib/hash/sha/256';
import { EmittedAsset, EmittedFile, OutputBundle } from '../rollup/types';
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

// TODO Lukas setAssetSource in transform needs to be repeated as well
// TODO Lukas use EmittedFile and ConsumedEmittedFile types?
interface OutputSpecificFileData {
	assetFileNames: string;
	// TODO Lukas instead of this map and relying on references, how about replacing the emitted file in
	// this.filesByReferenceId?
	assignedFileNames: Map<EmittedFile, string>;
	bundle: OutputBundle;
}

function getAssetFileName(
	name: string,
	source: string | Buffer,
	output: OutputSpecificFileData
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

type EmittedAssetWithSource = EmittedAsset & { source: string | Buffer };

function addAssetToBundle(asset: EmittedAssetWithSource, output: OutputSpecificFileData) {
	const fileName = getAssetFileName(asset.name, asset.source, output);
	output.assignedFileNames.set(asset, fileName);
	output.bundle[fileName] = {
		fileName,
		isAsset: true,
		source: asset.source
	};
}

// TODO Lukas general assumption: Having a source means having a reliable filename
// TODO Lukas only access filename during generate? Or disallow setSource if there is a fileName?
export class FileEmitter {
	private filesByReferenceId: Map<string, EmittedAsset> = new Map<string, EmittedAsset>();
	// tslint:disable member-ordering
	private buildFilesByReferenceId = this.filesByReferenceId;
	private output: OutputSpecificFileData | null = null;

	public emitFile = (emittedFile: EmittedFile): string => {
		if (emittedFile.type !== 'asset') {
			throw new Error(`Unhandled file type ${emittedFile.type}`);
		}
		if (typeof emittedFile.name !== 'string' || !isPlainName(emittedFile.name)) {
			return error(errInvalidAssetName(emittedFile.name));
		}
		if (this.output && emittedFile.source !== undefined) {
			addAssetToBundle(emittedFile as EmittedAssetWithSource, this.output);
		}
		return addWithNewReferenceId(emittedFile, this.filesByReferenceId, emittedFile.name);
	};

	public finaliseAssets() {
		for (const emittedFile of this.filesByReferenceId.values()) {
			if (emittedFile.type === 'asset' && emittedFile.source === undefined)
				error(errNoAssetSourceSet(emittedFile.name));
		}
	}

	public getFileName = (fileReferenceId: string) => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errAssetReferenceIdNotFoundForFilename(fileReferenceId));
		// TODO Lukas and there is no pre-assigned name
		if (!this.output) {
			// TODO Lukas proper error
			throw new Error('Cannot get file name during build phase');
		}
		const fileName = this.output.assignedFileNames.get(emittedFile);
		if (typeof fileName !== 'string') {
			return error(errAssetNotFinalisedForFileName(emittedFile.name));
		}
		return fileName;
	};

	// TODO Lukas this should only be allowed
	//  - unlimited times during build phase or
	//  - at most once during generate phase if no source has been set yet
	public setAssetSource = (fileReferenceId: string, source?: string | Buffer) => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errAssetReferenceIdNotFoundForSetSource(fileReferenceId));
		if (emittedFile.source !== undefined) return error(errAssetSourceAlreadySet(emittedFile.name));
		// TODO Lukas check for string | Buffer instead?
		if (typeof source !== 'string' && !source) {
			return error(errAssetSourceMissingForSetSource(emittedFile.name));
		}
		if (this.output) {
			// We must not modify the original assets to not interact with other outputs
			const assetWithSource = { ...emittedFile, source };
			this.filesByReferenceId.set(fileReferenceId, assetWithSource);
			addAssetToBundle(assetWithSource, this.output);
		} else {
			emittedFile.source = source;
		}
	};

	// TODO Lukas how do we unfinalize assets for different outputs that have their source set during generate? Test!
	public startOutput(outputBundle: OutputBundle, assetFileNames: string) {
		this.filesByReferenceId = new Map(this.buildFilesByReferenceId);
		this.output = {
			assetFileNames,
			assignedFileNames: new Map(),
			bundle: outputBundle
		};
		for (const emittedFile of this.filesByReferenceId.values()) {
			if (emittedFile.source !== undefined) {
				addAssetToBundle(emittedFile as EmittedAssetWithSource, this.output);
			}
		}
	}
}
