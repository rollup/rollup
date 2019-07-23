import sha256 from 'hash.js/lib/hash/sha/256';
import Chunk from '../Chunk';
import Graph from '../Graph';
import Module from '../Module';
import { OutputBundleWithPlaceholders } from '../rollup/types';
import { BuildPhase } from './buildPhase';
import {
	errAssetNotFinalisedForFileName,
	errAssetReferenceIdNotFoundForSetSource,
	errAssetSourceAlreadySet,
	errChunkNotGeneratedForFileName,
	errFailedValidation,
	errFileNameConflict,
	errFileReferenceIdNotFoundForFilename,
	errInvalidRollupPhaseForChunkEmission,
	errNoAssetSourceSet,
	error
} from './error';
import { extname } from './path';
import { isPlainPathFragment } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';

interface OutputSpecificFileData {
	assetFileNames: string;
	bundle: OutputBundleWithPlaceholders;
}

function generateAssetFileName(
	name: string | undefined,
	source: string | Buffer,
	output: OutputSpecificFileData
): string {
	const emittedName = name || 'asset';
	return makeUnique(
		renderNamePattern(output.assetFileNames, 'assetFileNames', placeholder => {
			switch (placeholder) {
				case 'hash':
					const hash = sha256();
					hash.update(emittedName);
					hash.update(':');
					hash.update(source);
					return hash.digest('hex').substr(0, 8);
				case 'name':
					return emittedName.substr(0, emittedName.length - extname(emittedName).length);
				case 'extname':
					return extname(emittedName);
				case 'ext':
					return extname(emittedName).substr(1);
			}
			return '';
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

function reserveFileNameInBundle(fileName: string, output: OutputSpecificFileData) {
	if (fileName in output.bundle) {
		return error(errFileNameConflict(fileName));
	}
	output.bundle[fileName] = FILE_PLACEHOLDER;
}

interface ConsumedChunk {
	fileName: string | undefined;
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

interface EmittedFile {
	fileName?: string;
	name?: string;
	type: 'chunk' | 'asset';
	[key: string]: unknown;
}

type ConsumedFile = ConsumedChunk | ConsumedAsset;

export const FILE_PLACEHOLDER = {
	placeholder: true
};

function hasValidType(
	emittedFile: unknown
): emittedFile is { type: 'asset' | 'chunk'; [key: string]: unknown } {
	return (
		emittedFile &&
		((emittedFile as { [key: string]: unknown }).type === 'asset' ||
			(emittedFile as { [key: string]: unknown }).type === 'chunk')
	);
}

function hasValidName(emittedFile: {
	type: 'asset' | 'chunk';
	[key: string]: unknown;
}): emittedFile is EmittedFile {
	const validatedName = emittedFile.fileName || emittedFile.name;
	return (
		!validatedName || (typeof validatedName === 'string' && isPlainPathFragment(validatedName))
	);
}

function getValidSource(
	source: unknown,
	emittedFile: { fileName?: string; name?: string },
	fileReferenceId: string | null
): string | Buffer {
	if (typeof source !== 'string' && !Buffer.isBuffer(source)) {
		const assetName = emittedFile.fileName || emittedFile.name || fileReferenceId;
		const assetDescription =
			typeof assetName === 'string' ? `asset "${assetName}"` : 'unnamed asset';
		return error(
			errFailedValidation(
				`Could not set source for ${assetDescription}, asset source needs to be a string of Buffer.`
			)
		);
	}
	return source;
}

function getAssetFileName(file: ConsumedAsset, referenceId: string): string {
	if (typeof file.fileName !== 'string') {
		return error(errAssetNotFinalisedForFileName(file.name || referenceId));
	}
	return file.fileName;
}

function getChunkFileName(file: ConsumedChunk): string {
	const fileName =
		file.module &&
		(file.module.facadeChunk ? file.module.facadeChunk.id : (file.module.chunk as Chunk).id);
	if (!fileName) return error(errChunkNotGeneratedForFileName(file.fileName || file.name));
	return fileName;
}

export class FileEmitter {
	private filesByReferenceId = new Map<string, ConsumedFile>();
	// tslint:disable member-ordering
	private buildFilesByReferenceId = this.filesByReferenceId;
	private graph: Graph;
	private output: OutputSpecificFileData | null = null;

	constructor(graph: Graph) {
		this.graph = graph;
	}

	public emitFile = (emittedFile: unknown): string => {
		if (!hasValidType(emittedFile)) {
			return error(
				errFailedValidation(
					`Emitted files must be of type "asset" or "chunk", received "${emittedFile &&
						(emittedFile as any).type}".`
				)
			);
		}
		if (!hasValidName(emittedFile)) {
			return error(
				errFailedValidation(
					`The "fileName" or "name" properties of emitted files must be strings that are neither absolute nor relative paths, received "${emittedFile.fileName ||
						emittedFile.name}".`
				)
			);
		}
		if (emittedFile.type === 'chunk') {
			return this.emitChunk(emittedFile);
		} else {
			return this.emitAsset(emittedFile);
		}
	};

	private emitAsset(emittedAsset: EmittedFile): string {
		const source =
			typeof emittedAsset.source !== 'undefined'
				? getValidSource(emittedAsset.source, emittedAsset, null)
				: undefined;
		const consumedAsset: ConsumedAsset = {
			fileName: emittedAsset.fileName,
			name: emittedAsset.name,
			source,
			type: 'asset'
		};
		if (this.output) {
			if (emittedAsset.fileName) {
				reserveFileNameInBundle(emittedAsset.fileName, this.output);
			}
			if (source !== undefined) {
				if (typeof consumedAsset.fileName !== 'string') {
					consumedAsset.fileName = generateAssetFileName(consumedAsset.name, source, this.output);
				}
				addAssetToBundle(consumedAsset as CompleteAsset, this.output);
			}
		}
		return this.assignReferenceId(
			consumedAsset,
			emittedAsset.fileName || emittedAsset.name || emittedAsset.type
		);
	}

	private emitChunk(emittedChunk: EmittedFile): string {
		if (this.graph.phase > BuildPhase.LOAD_AND_PARSE) {
			error(errInvalidRollupPhaseForChunkEmission());
		}
		if (typeof emittedChunk.id !== 'string') {
			return error(
				errFailedValidation(
					`Emitted chunks need to have a valid string id, received "${emittedChunk.id}"`
				)
			);
		}
		const consumedChunk: ConsumedChunk = {
			fileName: emittedChunk.fileName,
			module: null,
			name: emittedChunk.name || emittedChunk.id,
			type: 'chunk'
		};
		this.graph.moduleLoader
			.addEntryModules(
				[
					{
						fileName: emittedChunk.fileName || null,
						id: emittedChunk.id,
						name: emittedChunk.name || null
					}
				],
				false
			)
			.then(({ newEntryModules: [module] }) => {
				consumedChunk.module = module;
			})
			.catch(() => {
				// Avoid unhandled Promise rejection as the error will be thrown later
				// once module loading has finished
			});

		return this.assignReferenceId(consumedChunk, emittedChunk.id);
	}

	private assignReferenceId(file: ConsumedFile, idBase: string): string {
		let referenceId: string | undefined;
		do {
			const hash = sha256();
			if (referenceId) {
				hash.update(referenceId);
			} else {
				hash.update(idBase);
			}
			referenceId = hash.digest('hex').substr(0, 8);
		} while (this.filesByReferenceId.has(referenceId));
		this.filesByReferenceId.set(referenceId, file);
		return referenceId;
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
		if (emittedFile.type === 'chunk') {
			return getChunkFileName(emittedFile);
		} else {
			return getAssetFileName(emittedFile, fileReferenceId);
		}
	};

	// TODO Lukas this should only be allowed
	//  - unlimited times during build phase or
	//  - at most once during generate phase if no source has been set yet
	public setAssetSource = (fileReferenceId: string, requestedSource: unknown) => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errAssetReferenceIdNotFoundForSetSource(fileReferenceId));
		if (emittedFile.type !== 'asset') {
			return error(
				errFailedValidation(
					`Asset sources can only be set for emitted assets but "${fileReferenceId}" is an emitted chunk.`
				)
			);
		}
		if (emittedFile.source !== undefined) {
			return error(errAssetSourceAlreadySet(emittedFile.name || fileReferenceId));
		}
		const source = getValidSource(requestedSource, emittedFile, fileReferenceId);
		if (this.output) {
			const fileName =
				emittedFile.fileName || generateAssetFileName(emittedFile.name, source, this.output);
			// We must not modify the original assets to not interact with other outputs
			const assetWithSource = { ...emittedFile, fileName, source };
			this.filesByReferenceId.set(fileReferenceId, assetWithSource);
			addAssetToBundle(assetWithSource, this.output);
		} else {
			emittedFile.source = source;
		}
	};

	public startOutput(outputBundle: OutputBundleWithPlaceholders, assetFileNames: string) {
		this.filesByReferenceId = new Map(this.buildFilesByReferenceId);
		this.output = {
			assetFileNames,
			bundle: outputBundle
		};
		for (const emittedFile of this.filesByReferenceId.values()) {
			if (emittedFile.fileName) {
				reserveFileNameInBundle(emittedFile.fileName, this.output);
			}
		}
		for (const [referenceId, emittedFile] of this.filesByReferenceId.entries()) {
			if (emittedFile.type === 'asset' && emittedFile.source !== undefined) {
				const fileName =
					emittedFile.fileName ||
					generateAssetFileName(emittedFile.name, emittedFile.source, this.output);
				// We must not modify the original assets to not interact with other outputs
				const assetWithFileName = { ...emittedFile, fileName };
				this.filesByReferenceId.set(referenceId, assetWithFileName);
				addAssetToBundle(assetWithFileName as CompleteAsset, this.output);
			}
		}
	}
}
