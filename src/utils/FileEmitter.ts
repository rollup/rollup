import type Chunk from '../Chunk';
import type Graph from '../Graph';
import type Module from '../Module';
import type {
	EmittedChunk,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	WarningHandler
} from '../rollup/types';
import { BuildPhase } from './buildPhase';
import { createHash } from './crypto';
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
import { defaultHashSize } from './hashPlaceholders';
import type { OutputBundleWithPlaceholders } from './outputBundle';
import { FILE_PLACEHOLDER, lowercaseBundleKeys } from './outputBundle';
import { extname } from './path';
import { isPathFragment } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';

function generateAssetFileName(
	name: string | undefined,
	source: string | Uint8Array,
	outputOptions: NormalizedOutputOptions,
	bundle: OutputBundleWithPlaceholders
): string {
	const emittedName = outputOptions.sanitizeFileName(name || 'asset');
	return makeUnique(
		renderNamePattern(
			typeof outputOptions.assetFileNames === 'function'
				? outputOptions.assetFileNames({ name, source, type: 'asset' })
				: outputOptions.assetFileNames,
			'output.assetFileNames',
			{
				ext: () => extname(emittedName).substring(1),
				extname: () => extname(emittedName),
				hash: size =>
					createHash()
						.update(source)
						.digest('hex')
						.substring(0, size || defaultHashSize),
				name: () => emittedName.substring(0, emittedName.length - extname(emittedName).length)
			}
		),
		bundle
	);
}

function reserveFileNameInBundle(
	fileName: string,
	{ bundle }: FileEmitterOutput,
	warn: WarningHandler
) {
	if (bundle[lowercaseBundleKeys].has(fileName.toLowerCase())) {
		warn(errFileNameConflict(fileName));
	} else {
		bundle[fileName] = FILE_PLACEHOLDER;
	}
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
	source: string | Uint8Array | undefined;
	type: 'asset';
}

interface EmittedFile {
	[key: string]: unknown;
	fileName?: string;
	name?: string;
	type: 'chunk' | 'asset';
}

type ConsumedFile = ConsumedChunk | ConsumedAsset;

function hasValidType(
	emittedFile: unknown
): emittedFile is { [key: string]: unknown; type: 'asset' | 'chunk' } {
	return Boolean(
		emittedFile &&
			((emittedFile as { [key: string]: unknown }).type === 'asset' ||
				(emittedFile as { [key: string]: unknown }).type === 'chunk')
	);
}

function hasValidName(emittedFile: {
	[key: string]: unknown;
	type: 'asset' | 'chunk';
}): emittedFile is EmittedFile {
	const validatedName = emittedFile.fileName || emittedFile.name;
	return !validatedName || (typeof validatedName === 'string' && !isPathFragment(validatedName));
}

function getValidSource(
	source: unknown,
	emittedFile: { fileName?: string; name?: string },
	fileReferenceId: string | null
): string | Uint8Array {
	if (!(typeof source === 'string' || source instanceof Uint8Array)) {
		const assetName = emittedFile.fileName || emittedFile.name || fileReferenceId;
		return error(
			errFailedValidation(
				`Could not set source for ${
					typeof assetName === 'string' ? `asset "${assetName}"` : 'unnamed asset'
				}, asset source needs to be a string, Uint8Array or Buffer.`
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

function getChunkFileName(
	file: ConsumedChunk,
	facadeChunkByModule: ReadonlyMap<Module, Chunk> | null
): string {
	if (file.fileName) {
		return file.fileName;
	}
	if (facadeChunkByModule) {
		const chunk = facadeChunkByModule.get(file.module!)!;
		return chunk.id || chunk.getFileName();
	}
	return error(errChunkNotGeneratedForFileName(file.fileName || file.name));
}

interface FileEmitterOutput {
	bundle: OutputBundleWithPlaceholders;
	fileNamesBySource: Map<string, string>;
	outputOptions: NormalizedOutputOptions;
}

export class FileEmitter {
	private facadeChunkByModule: ReadonlyMap<Module, Chunk> | null = null;
	private readonly filesByReferenceId: Map<string, ConsumedFile>;
	private nextIdBase = 1;
	private output: FileEmitterOutput | null = null;

	constructor(
		private readonly graph: Graph,
		private readonly options: NormalizedInputOptions,
		baseFileEmitter?: FileEmitter
	) {
		this.filesByReferenceId = baseFileEmitter
			? new Map(baseFileEmitter.filesByReferenceId)
			: new Map();
	}

	public emitFile = (emittedFile: unknown): string => {
		if (!hasValidType(emittedFile)) {
			return error(
				errFailedValidation(
					`Emitted files must be of type "asset" or "chunk", received "${
						emittedFile && (emittedFile as any).type
					}".`
				)
			);
		}
		if (!hasValidName(emittedFile)) {
			return error(
				errFailedValidation(
					`The "fileName" or "name" properties of emitted files must be strings that are neither absolute nor relative paths, received "${
						emittedFile.fileName || emittedFile.name
					}".`
				)
			);
		}
		if (emittedFile.type === 'chunk') {
			return this.emitChunk(emittedFile);
		}
		return this.emitAsset(emittedFile);
	};

	public finaliseAssets = (): void => {
		for (const [referenceId, emittedFile] of this.filesByReferenceId) {
			if (emittedFile.type === 'asset' && typeof emittedFile.fileName !== 'string')
				return error(errNoAssetSourceSet(emittedFile.name || referenceId));
		}
	};

	public getFileName = (fileReferenceId: string): string => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errFileReferenceIdNotFoundForFilename(fileReferenceId));
		if (emittedFile.type === 'chunk') {
			return getChunkFileName(emittedFile, this.facadeChunkByModule);
		}
		return getAssetFileName(emittedFile, fileReferenceId);
	};

	public setAssetSource = (referenceId: string, requestedSource: unknown): void => {
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

	public setChunkInformation = (facadeChunkByModule: ReadonlyMap<Module, Chunk>): void => {
		this.facadeChunkByModule = facadeChunkByModule;
	};

	public setOutputBundle = (
		bundle: OutputBundleWithPlaceholders,
		outputOptions: NormalizedOutputOptions
	): void => {
		const fileNamesBySource = new Map();
		const output = (this.output = { bundle, fileNamesBySource, outputOptions });
		for (const emittedFile of this.filesByReferenceId.values()) {
			if (emittedFile.fileName) {
				reserveFileNameInBundle(emittedFile.fileName, output, this.options.onwarn);
				if (emittedFile.type === 'asset' && typeof emittedFile.source === 'string') {
					fileNamesBySource.set(emittedFile.source, emittedFile.fileName);
				}
			}
		}
		for (const [referenceId, consumedFile] of this.filesByReferenceId) {
			if (consumedFile.type === 'asset' && consumedFile.source !== undefined) {
				this.finalizeAsset(consumedFile, consumedFile.source, referenceId, output);
			}
		}
	};

	private assignReferenceId(file: ConsumedFile, idBase: string): string {
		let referenceId: string | undefined;

		do {
			referenceId = createHash()
				.update(referenceId || idBase)
				.digest('hex')
				.substring(0, 8);
		} while (this.filesByReferenceId.has(referenceId));

		this.filesByReferenceId.set(referenceId, file);
		return referenceId;
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
			emittedAsset.fileName || emittedAsset.name || String(this.nextIdBase++)
		);
		if (this.output) {
			if (emittedAsset.fileName) {
				reserveFileNameInBundle(emittedAsset.fileName, this.output, this.options.onwarn);
			}
			if (source !== undefined) {
				this.finalizeAsset(consumedAsset, source, referenceId, this.output);
			}
		}
		return referenceId;
	}

	private emitChunk(emittedChunk: EmittedFile): string {
		if (this.graph.phase > BuildPhase.LOAD_AND_PARSE) {
			return error(errInvalidRollupPhaseForChunkEmission());
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
			.emitChunk(emittedChunk as unknown as EmittedChunk)
			.then(module => (consumedChunk.module = module))
			.catch(() => {
				// Avoid unhandled Promise rejection as the error will be thrown later
				// once module loading has finished
			});

		return this.assignReferenceId(consumedChunk, emittedChunk.id);
	}

	private finalizeAsset(
		consumedFile: ConsumedFile,
		source: string | Uint8Array,
		referenceId: string,
		{ bundle, fileNamesBySource, outputOptions }: FileEmitterOutput
	): void {
		const fileName =
			consumedFile.fileName ||
			(typeof source === 'string' && fileNamesBySource.get(source)) ||
			generateAssetFileName(consumedFile.name, source, outputOptions, bundle);

		// We must not modify the original assets to avoid interaction between outputs
		const assetWithFileName = { ...consumedFile, fileName, source };
		this.filesByReferenceId.set(referenceId, assetWithFileName);
		if (typeof source === 'string') {
			fileNamesBySource.set(source, fileName);
		}
		bundle[fileName] = {
			fileName,
			name: consumedFile.name,
			source,
			type: 'asset'
		};
	}
}
