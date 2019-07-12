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

interface ConsumedChunk {
	module: null | Module;
	name: string;
	type: 'chunk';
}

type ConsumedFile = ConsumedChunk | EmittedAsset;

// TODO Lukas general assumption: Having a source means having a reliable filename
// TODO Lukas only access filename during generate? Or disallow setSource if there is a fileName?
export class FileEmitter {
	private filesByReferenceId: Map<string, ConsumedFile> = new Map<string, EmittedAsset>();
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
			// TODO Lukas make proper error and test
			default:
				throw new Error(`Unhandled file type ${(emittedFile as any).type}`);
		}
	};

	private emitAsset(asset: EmittedAsset): string {
		// TODO Lukas this could become shared validation
		if (typeof asset.name !== 'string' || !isPlainName(asset.name)) {
			return error(errInvalidAssetName(asset.name));
		}
		if (this.output && asset.source !== undefined) {
			addAssetToBundle(asset as EmittedAssetWithSource, this.output);
		}
		return addWithNewReferenceId(asset, this.filesByReferenceId, asset.name);
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
		for (const emittedFile of this.filesByReferenceId.values()) {
			if (emittedFile.type === 'asset' && emittedFile.source === undefined)
				error(errNoAssetSourceSet(emittedFile.name));
		}
	}

	public getFileName = (fileReferenceId: string) => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errFileReferenceIdNotFoundForFilename(fileReferenceId));
		switch (emittedFile.type) {
			case 'asset': {
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
		// TODO Lukas refine error
		if (emittedFile.type !== 'asset') throw new Error('cannot set source for chunk');
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
			if (emittedFile.type === 'asset' && emittedFile.source !== undefined) {
				addAssetToBundle(emittedFile as EmittedAssetWithSource, this.output);
			}
		}
	}
}
