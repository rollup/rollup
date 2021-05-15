import Chunk from '../Chunk';
import Graph from '../Graph';
import Module from '../Module';
import {
	EmittedChunk,
	FilePlaceholder,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputBundleWithPlaceholders,
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
	error,
	warnDeprecation
} from './error';
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
			}
		),
		bundle
	);
}

function reserveFileNameInBundle(
	fileName: string,
	bundle: OutputBundleWithPlaceholders,
	warn: WarningHandler
) {
	if (fileName in bundle) {
		warn(errFileNameConflict(fileName));
	}
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
	source: string | Uint8Array | undefined;
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
	return Boolean(
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
	facadeChunkByModule: Map<Module, Chunk> | null
): string {
	const fileName = file.fileName || (file.module && facadeChunkByModule?.get(file.module)?.id);
	if (!fileName) return error(errChunkNotGeneratedForFileName(file.fileName || file.name));
	return fileName;
}

export class FileEmitter {
	private bundle: OutputBundleWithPlaceholders | null = null;
	private facadeChunkByModule: Map<Module, Chunk> | null = null;
	private filesByReferenceId: Map<string, ConsumedFile>;
	private outputOptions: NormalizedOutputOptions | null = null;

	constructor(
		private readonly graph: Graph,
		private readonly options: NormalizedInputOptions,
		baseFileEmitter?: FileEmitter
	) {
		this.filesByReferenceId = baseFileEmitter
			? new Map(baseFileEmitter.filesByReferenceId)
			: new Map();
	}

	public assertAssetsFinalized = (): void => {
		for (const [referenceId, emittedFile] of this.filesByReferenceId.entries()) {
			if (emittedFile.type === 'asset' && typeof emittedFile.fileName !== 'string')
				return error(errNoAssetSourceSet(emittedFile.name || referenceId));
		}
	};

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
		} else {
			return this.emitAsset(emittedFile);
		}
	};

	public getFileName = (fileReferenceId: string): string => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(errFileReferenceIdNotFoundForFilename(fileReferenceId));
		if (emittedFile.type === 'chunk') {
			return getChunkFileName(emittedFile, this.facadeChunkByModule);
		} else {
			return getAssetFileName(emittedFile, fileReferenceId);
		}
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
		if (this.bundle) {
			this.finalizeAsset(consumedFile, source, referenceId, this.bundle);
		} else {
			consumedFile.source = source;
		}
	};

	public setOutputBundle = (
		outputBundle: OutputBundleWithPlaceholders,
		outputOptions: NormalizedOutputOptions,
		facadeChunkByModule: Map<Module, Chunk>
	): void => {
		this.outputOptions = outputOptions;
		this.bundle = outputBundle;
		this.facadeChunkByModule = facadeChunkByModule;
		for (const emittedFile of this.filesByReferenceId.values()) {
			if (emittedFile.fileName) {
				reserveFileNameInBundle(emittedFile.fileName, this.bundle, this.options.onwarn);
			}
		}
		for (const [referenceId, consumedFile] of this.filesByReferenceId.entries()) {
			if (consumedFile.type === 'asset' && consumedFile.source !== undefined) {
				this.finalizeAsset(consumedFile, consumedFile.source, referenceId, this.bundle);
			}
		}
	};

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
		if (this.bundle) {
			if (emittedAsset.fileName) {
				reserveFileNameInBundle(emittedAsset.fileName, this.bundle, this.options.onwarn);
			}
			if (source !== undefined) {
				this.finalizeAsset(consumedAsset, source, referenceId, this.bundle);
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
			.emitChunk((emittedChunk as unknown) as EmittedChunk)
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
		bundle: OutputBundleWithPlaceholders
	): void {
		const fileName =
			consumedFile.fileName ||
			findExistingAssetFileNameWithSource(bundle, source) ||
			generateAssetFileName(consumedFile.name, source, this.outputOptions!, bundle);

		// We must not modify the original assets to avoid interaction between outputs
		const assetWithFileName = { ...consumedFile, source, fileName };
		this.filesByReferenceId.set(referenceId, assetWithFileName);
		const options = this.options;
		bundle[fileName] = {
			fileName,
			name: consumedFile.name,
			get isAsset(): true {
				warnDeprecation(
					'Accessing "isAsset" on files in the bundle is deprecated, please use "type === \'asset\'" instead',
					true,
					options
				);

				return true;
			},
			source,
			type: 'asset'
		};
	}
}

function findExistingAssetFileNameWithSource(
	bundle: OutputBundleWithPlaceholders,
	source: string | Uint8Array
): string | null {
	for (const [fileName, outputFile] of Object.entries(bundle)) {
		if (outputFile.type === 'asset' && areSourcesEqual(source, outputFile.source)) return fileName;
	}
	return null;
}

function areSourcesEqual(
	sourceA: string | Uint8Array | Buffer,
	sourceB: string | Uint8Array | Buffer
): boolean {
	if (typeof sourceA === 'string') {
		return sourceA === sourceB;
	}
	if (typeof sourceB === 'string') {
		return false;
	}
	if ('equals' in sourceA) {
		return sourceA.equals(sourceB);
	}
	if (sourceA.length !== sourceB.length) {
		return false;
	}
	for (let index = 0; index < sourceA.length; index++) {
		if (sourceA[index] !== sourceB[index]) {
			return false;
		}
	}
	return true;
}
