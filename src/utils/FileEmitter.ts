import sha256 from 'hash.js/lib/hash/sha/256';
import Chunk from '../Chunk';
import Graph from '../Graph';
import Module from '../Module';
import { EmittedAsset, EmittedChunk, EmittedFile, OutputBundle } from '../rollup/types';
import { BuildPhase } from './buildPhase';
import {
	errAssetNotFinalisedForFileName,
	errAssetReferenceIdNotFoundForSetSource,
	errAssetSourceAlreadySet,
	errAssetSourceMissingForSetSource,
	errChunkNotGeneratedForFileName,
	errFileReferenceIdNotFoundForFilename,
	errInvalidAssetName,
	errInvalidRollupPhaseForChunkEmission,
	errNoAssetSourceSet,
	error
} from './error';
import { extname } from './path';
import { addWithNewReferenceId } from './referenceIds';
import { isPlainPathFragment } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';

// TODO Lukas setAssetSource in transform needs to be repeated as well
// TODO Lukas use EmittedFile and ConsumedEmittedFile types?
interface OutputSpecificFileData {
	assetFileNames: string;
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

type CompleteAsset = ConsumedAsset & { fileName: string; source: string | Buffer };

function addAssetToBundle(asset: CompleteAsset, output: OutputSpecificFileData) {
	output.bundle[asset.fileName] = {
		fileName: asset.fileName,
		isAsset: true,
		source: asset.source
	};
}

interface ConsumedChunk {
	module: null | Module;
	name: string;
	type: 'chunk';
}

interface ConsumedAsset {
	fileName: string | undefined;
	name: string | undefined;
	source: string | Buffer | undefined;
	type: 'asset';
}

type ConsumedFile = ConsumedChunk | ConsumedAsset;

// TODO Lukas general assumption: Having a source means having a reliable filename
// TODO Lukas only access filename during generate? Or disallow setSource if there is a fileName?
// TODO Lukas convert all "throw" into proper errors
export class FileEmitter {
	private filesByReferenceId = new Map<string, ConsumedFile>();
	// tslint:disable member-ordering
	private buildFilesByReferenceId = this.filesByReferenceId;
	private graph: Graph;
	private output: OutputSpecificFileData | null = null;

	constructor(graph: Graph) {
		this.graph = graph;
	}

	public emitFile = (emittedFile: EmittedFile): string => {
		// TODO Lukas combine switch statements into object
		switch (emittedFile.type) {
			case 'asset':
				return this.emitAsset(emittedFile);
			case 'chunk':
				return this.emitChunk(emittedFile);
			default:
				throw new Error(`Unhandled file type ${(emittedFile as any).type}`);
		}
	};

	private emitAsset(asset: EmittedAsset): string {
		// TODO Lukas this could become shared validation
		// TODO Lukas test validations
		if ('fileName' in asset) {
			if ('name' in asset) {
				throw new Error('Cannot use both name and fileName');
			}
			if (typeof asset.fileName !== 'string' || !isPlainPathFragment(asset.fileName)) {
				throw new Error('Asset fileName must be non-relative, non-absolute path');
			}
		} else if ('name' in asset) {
			if (typeof asset.name !== 'string' || !isPlainPathFragment(asset.name)) {
				return error(errInvalidAssetName(asset.name as string));
			}
		}
		const consumedAsset: ConsumedAsset = {
			fileName: asset.fileName,
			name: asset.name,
			source: asset.source,
			type: 'asset'
		};
		if (this.output && asset.source !== undefined) {
			if (typeof consumedAsset.fileName !== 'string') {
				consumedAsset.fileName = getAssetFileName(
					consumedAsset.name || 'asset',
					asset.source,
					this.output
				);
			}
			addAssetToBundle(consumedAsset as CompleteAsset, this.output);
		}
		return addWithNewReferenceId(
			consumedAsset,
			this.filesByReferenceId,
			asset.fileName || asset.name || asset.type
		);
	}

	private emitChunk(chunk: EmittedChunk): string {
		if (this.graph.phase > BuildPhase.LOAD_AND_PARSE) {
			error(errInvalidRollupPhaseForChunkEmission());
		}
		const consumedChunk: ConsumedChunk = {
			module: null,
			name: chunk.name || chunk.id,
			type: 'chunk'
		};
		this.graph.moduleLoader
			.addEntryModules([{ alias: chunk.name || null, unresolvedId: chunk.id }], false)
			.then(({ newEntryModules: [module] }) => {
				consumedChunk.module = module;
			})
			.catch(() => {
				// Avoid unhandled Promise rejection as the error will be thrown later
				// once module loading has finished
			});

		return addWithNewReferenceId(consumedChunk, this.filesByReferenceId, chunk.id);
	}

	public finaliseAssets() {
		for (const [referenceId, emittedFile] of this.filesByReferenceId.entries()) {
			if (emittedFile.type === 'asset' && typeof emittedFile.fileName !== 'string')
				error(errNoAssetSourceSet(emittedFile.name || referenceId));
		}
	}

	public getFileName = (fileReferenceId: string) => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errFileReferenceIdNotFoundForFilename(fileReferenceId));
		switch (emittedFile.type) {
			case 'asset': {
				if (typeof emittedFile.fileName !== 'string') {
					return error(errAssetNotFinalisedForFileName(emittedFile.name || fileReferenceId));
				}
				return emittedFile.fileName;
			}
			case 'chunk': {
				const fileName =
					emittedFile.module &&
					(emittedFile.module.facadeChunk
						? emittedFile.module.facadeChunk.id
						: (emittedFile.module.chunk as Chunk).id);
				if (!fileName) return error(errChunkNotGeneratedForFileName(emittedFile.name));
				return fileName;
			}
		}
	};

	// TODO Lukas this should only be allowed
	//  - unlimited times during build phase or
	//  - at most once during generate phase if no source has been set yet
	public setAssetSource = (fileReferenceId: string, source?: string | Buffer) => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errAssetReferenceIdNotFoundForSetSource(fileReferenceId));
		if (emittedFile.type !== 'asset') throw new Error('cannot set source for chunk');
		if (emittedFile.source !== undefined)
			return error(errAssetSourceAlreadySet(emittedFile.name || fileReferenceId));
		// TODO Lukas check for string | Buffer instead?
		if (typeof source !== 'string' && !source) {
			return error(errAssetSourceMissingForSetSource(emittedFile.name || fileReferenceId));
		}
		if (this.output) {
			const fileName =
				emittedFile.fileName || getAssetFileName(emittedFile.name || 'asset', source, this.output);
			// We must not modify the original assets to not interact with other outputs
			const assetWithSource = { ...emittedFile, fileName, source };
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
			bundle: outputBundle
		};
		for (const [referenceId, emittedFile] of this.filesByReferenceId.entries()) {
			if (emittedFile.type === 'asset' && emittedFile.source !== undefined) {
				const fileName =
					emittedFile.fileName ||
					getAssetFileName(emittedFile.name || 'asset', emittedFile.source, this.output);
				// We must not modify the original assets to not interact with other outputs
				const assetWithFileName = { ...emittedFile, fileName };
				this.filesByReferenceId.set(referenceId, assetWithFileName);
				addAssetToBundle(assetWithFileName as CompleteAsset, this.output);
			}
		}
	}
}
