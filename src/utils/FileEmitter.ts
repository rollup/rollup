import Chunk from '../Chunk';
import Graph from '../Graph';
import Module from '../Module';
import { FilePlaceholder, OutputBundleWithPlaceholders } from '../rollup/types';
import { BuildPhase } from './buildPhase';
import { createHash } from './crypto';
import {
	errAssetNotFinalisedForFileName,
	errAssetReferenceIdNotFoundForSetSource,
	errAssetSourceAlreadySet,
	errChunkNotGeneratedForFileName,
	errFailedValidation,
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
		renderNamePattern(output.assetFileNames, 'output.assetFileNames', {
			hash() {
				const hash = createHash();
				hash.update(emittedName);
				hash.update(':');
				hash.update(source);
				return hash.digest('hex').substr(0, 8);
			},
			ext: () => extname(emittedName).substr(1),
			extname: () => extname(emittedName),
			name: () => emittedName.substr(0, emittedName.length - extname(emittedName).length)
		}),
		output.bundle
	);
}

function reserveFileNameInBundle(fileName: string, bundle: OutputBundleWithPlaceholders) {
	// TODO this should warn if the fileName is already in the bundle,
	//  but until #3174 is fixed, this raises spurious warnings and is disabled
	bundle[fileName] = FILE_PLACEHOLDER;
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

export const FILE_PLACEHOLDER: FilePlaceholder = {
	type: 'placeholder'
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
		return error(
			errFailedValidation(
				`Could not set source for ${
					typeof assetName === 'string' ? `asset "${assetName}"` : 'unnamed asset'
				}, asset source needs to be a string of Buffer.`
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
	const fileName = file.fileName || (file.module && (file.module.facadeChunk as Chunk).id);
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
					`The "fileName" or "name" properties of emitted files must be strings that are neither absolute nor relative paths and do not contain invalid characters, received "${emittedFile.fileName ||
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

	public getFileName = (fileReferenceId: string) => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errFileReferenceIdNotFoundForFilename(fileReferenceId));
		if (emittedFile.type === 'chunk') {
			return getChunkFileName(emittedFile);
		} else {
			return getAssetFileName(emittedFile, fileReferenceId);
		}
	};

	public setAssetSource = (referenceId: string, requestedSource: unknown) => {
		const consumedFile = this.filesByReferenceId.get(referenceId);
		if (!consumedFile) return error(errAssetReferenceIdNotFoundForSetSource(referenceId));
		if (consumedFile.type !== 'asset') {
			return error(
				errFailedValidation(
					`Asset sources can only be set for emitted assets but "${referenceId}" is an emitted chunk.`
				)
			);
		}
		if (consumedFile.source !== undefined) {
			return error(errAssetSourceAlreadySet(consumedFile.name || referenceId));
		}
		const source = getValidSource(requestedSource, consumedFile, referenceId);
		if (this.output) {
			this.finalizeAsset(consumedFile, source, referenceId, this.output);
		} else {
			consumedFile.source = source;
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
				reserveFileNameInBundle(emittedFile.fileName, this.output.bundle);
			}
		}
		for (const [referenceId, consumedFile] of this.filesByReferenceId.entries()) {
			if (consumedFile.type === 'asset' && consumedFile.source !== undefined) {
				this.finalizeAsset(consumedFile, consumedFile.source, referenceId, this.output);
			}
		}
	}

	public assertAssetsFinalized() {
		for (const [referenceId, emittedFile] of this.filesByReferenceId.entries()) {
			if (emittedFile.type === 'asset' && typeof emittedFile.fileName !== 'string')
				error(errNoAssetSourceSet(emittedFile.name || referenceId));
		}
	}

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
		const referenceId = this.assignReferenceId(
			consumedAsset,
			emittedAsset.fileName || emittedAsset.name || emittedAsset.type
		);
		if (this.output) {
			if (emittedAsset.fileName) {
				reserveFileNameInBundle(emittedAsset.fileName, this.output.bundle);
			}
			if (source !== undefined) {
				this.finalizeAsset(consumedAsset, source, referenceId, this.output);
			}
		}
		return referenceId;
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
			const hash = createHash();
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

	private finalizeAsset(
		consumedFile: ConsumedFile,
		source: string | Buffer,
		referenceId: string,
		output: OutputSpecificFileData
	) {
		const fileName =
			consumedFile.fileName ||
			this.findExistingAssetFileNameWithSource(output.bundle, source) ||
			generateAssetFileName(consumedFile.name, source, output);

		// We must not modify the original assets to avoid interaction between outputs
		const assetWithFileName = { ...consumedFile, source, fileName };
		this.filesByReferenceId.set(referenceId, assetWithFileName);
		const graph = this.graph;
		output.bundle[fileName] = {
			fileName,
			get isAsset(): true {
				graph.warnDeprecation(
					'Accessing "isAsset" on files in the bundle is deprecated, please use "type === \'asset\'" instead',
					false
				);

				return true;
			},
			source,
			type: 'asset'
		};
	}

	private findExistingAssetFileNameWithSource(
		bundle: OutputBundleWithPlaceholders,
		source: string | Buffer
	): string | null {
		for (const fileName of Object.keys(bundle)) {
			const outputFile = bundle[fileName];
			if (
				outputFile.type === 'asset' &&
				(Buffer.isBuffer(source) && Buffer.isBuffer(outputFile.source)
					? source.equals(outputFile.source)
					: source === outputFile.source)
			)
				return fileName;
		}
		return null;
	}
}
