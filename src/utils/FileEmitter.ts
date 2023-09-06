import type Chunk from '../Chunk';
import type Graph from '../Graph';
import type Module from '../Module';
import type {
	EmittedAsset,
	EmittedChunk,
	EmittedPrebuiltChunk,
	LogHandler,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputChunk
} from '../rollup/types';
import { BuildPhase } from './buildPhase';
import { createHash } from './crypto';
import { getOrCreate } from './getOrCreate';
import { defaultHashSize } from './hashPlaceholders';
import { LOGLEVEL_WARN } from './logging';
import {
	error,
	logAssetNotFinalisedForFileName,
	logAssetReferenceIdNotFoundForSetSource,
	logAssetSourceAlreadySet,
	logChunkNotGeneratedForFileName,
	logFailedValidation,
	logFileNameConflict,
	logFileReferenceIdNotFoundForFilename,
	logInvalidRollupPhaseForChunkEmission,
	logNoAssetSourceSet
} from './logs';
import type { OutputBundleWithPlaceholders } from './outputBundle';
import { FILE_PLACEHOLDER, lowercaseBundleKeys } from './outputBundle';
import { extname } from './path';
import { isPathFragment } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';

function getSourceHash(source: string | Uint8Array): string {
	return createHash().update(source).digest('hex');
}

function generateAssetFileName(
	name: string | undefined,
	source: string | Uint8Array,
	sourceHash: string,
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
				ext: () => extname(emittedName).slice(1),
				extname: () => extname(emittedName),
				hash: size => sourceHash.slice(0, Math.max(0, size || defaultHashSize)),
				name: () =>
					emittedName.slice(0, Math.max(0, emittedName.length - extname(emittedName).length))
			}
		),
		bundle
	);
}

function reserveFileNameInBundle(fileName: string, { bundle }: FileEmitterOutput, log: LogHandler) {
	if (bundle[lowercaseBundleKeys].has(fileName.toLowerCase())) {
		log(LOGLEVEL_WARN, logFileNameConflict(fileName));
	} else {
		bundle[fileName] = FILE_PLACEHOLDER;
	}
}

type ConsumedChunk = Pick<EmittedChunk, 'fileName' | 'type'> & {
	module: null | Module;
	name: string;
	referenceId: string;
};

type ConsumedPrebuiltChunk = EmittedPrebuiltChunk & {
	referenceId: string;
};

type ConsumedAsset = EmittedAsset & {
	needsCodeReference: boolean;
	referenceId: string;
};

type ConsumedFile = ConsumedChunk | ConsumedAsset | ConsumedPrebuiltChunk;

type EmittedFileType = ConsumedFile['type'];

interface EmittedFile {
	[key: string]: unknown;
	fileName?: string;
	name?: string;
	type: EmittedFileType;
}

const emittedFileTypes: Set<EmittedFileType> = new Set(['chunk', 'asset', 'prebuilt-chunk']);

function hasValidType(emittedFile: unknown): emittedFile is {
	[key: string]: unknown;
	type: EmittedFileType;
} {
	return Boolean(
		emittedFile &&
			emittedFileTypes.has((emittedFile as { [key: string]: unknown; type: EmittedFileType }).type)
	);
}

function hasValidName(emittedFile: {
	[key: string]: unknown;
	type: EmittedFileType;
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
			logFailedValidation(
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
		return error(logAssetNotFinalisedForFileName(file.name || referenceId));
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
		return facadeChunkByModule.get(file.module!)!.getFileName();
	}
	return error(logChunkNotGeneratedForFileName(file.fileName || file.name));
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
	private outputFileEmitters: FileEmitter[] = [];

	constructor(
		private readonly graph: Graph,
		private readonly options: NormalizedInputOptions,
		baseFileEmitter?: FileEmitter
	) {
		this.filesByReferenceId = baseFileEmitter
			? new Map(baseFileEmitter.filesByReferenceId)
			: new Map();
		baseFileEmitter?.addOutputFileEmitter(this);
	}

	public emitFile = (emittedFile: unknown): string => {
		if (!hasValidType(emittedFile)) {
			return error(
				logFailedValidation(
					`Emitted files must be of type "asset", "chunk" or "prebuilt-chunk", received "${
						emittedFile && (emittedFile as any).type
					}".`
				)
			);
		}
		if (emittedFile.type === 'prebuilt-chunk') {
			return this.emitPrebuiltChunk(emittedFile);
		}
		if (!hasValidName(emittedFile)) {
			return error(
				logFailedValidation(
					`The "fileName" or "name" properties of emitted chunks and assets must be strings that are neither absolute nor relative paths, received "${
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
				return error(logNoAssetSourceSet(emittedFile.name || referenceId));
		}
	};

	public getFileName = (fileReferenceId: string): string => {
		const emittedFile = this.filesByReferenceId.get(fileReferenceId);
		if (!emittedFile) return error(logFileReferenceIdNotFoundForFilename(fileReferenceId));
		if (emittedFile.type === 'chunk') {
			return getChunkFileName(emittedFile, this.facadeChunkByModule);
		}
		if (emittedFile.type === 'prebuilt-chunk') {
			return emittedFile.fileName;
		}
		return getAssetFileName(emittedFile, fileReferenceId);
	};

	public setAssetSource = (referenceId: string, requestedSource: unknown): void => {
		const consumedFile = this.filesByReferenceId.get(referenceId);
		if (!consumedFile) return error(logAssetReferenceIdNotFoundForSetSource(referenceId));
		if (consumedFile.type !== 'asset') {
			return error(
				logFailedValidation(
					`Asset sources can only be set for emitted assets but "${referenceId}" is an emitted chunk.`
				)
			);
		}
		if (consumedFile.source !== undefined) {
			return error(logAssetSourceAlreadySet(consumedFile.name || referenceId));
		}
		const source = getValidSource(requestedSource, consumedFile, referenceId);
		if (this.output) {
			this.finalizeAdditionalAsset(consumedFile, source, this.output);
		} else {
			consumedFile.source = source;
			for (const emitter of this.outputFileEmitters) {
				emitter.finalizeAdditionalAsset(consumedFile, source, emitter.output!);
			}
		}
	};

	public setChunkInformation = (facadeChunkByModule: ReadonlyMap<Module, Chunk>): void => {
		this.facadeChunkByModule = facadeChunkByModule;
	};

	public setOutputBundle = (
		bundle: OutputBundleWithPlaceholders,
		outputOptions: NormalizedOutputOptions
	): void => {
		const output = (this.output = {
			bundle,
			fileNamesBySource: new Map<string, string>(),
			outputOptions
		});
		for (const emittedFile of this.filesByReferenceId.values()) {
			if (emittedFile.fileName) {
				reserveFileNameInBundle(emittedFile.fileName, output, this.options.onLog);
			}
		}
		const consumedAssetsByHash = new Map<string, ConsumedAsset[]>();
		for (const consumedFile of this.filesByReferenceId.values()) {
			if (consumedFile.type === 'asset' && consumedFile.source !== undefined) {
				if (consumedFile.fileName) {
					this.finalizeAdditionalAsset(consumedFile, consumedFile.source, output);
				} else {
					const sourceHash = getSourceHash(consumedFile.source);
					getOrCreate(consumedAssetsByHash, sourceHash, () => []).push(consumedFile);
				}
			} else if (consumedFile.type === 'prebuilt-chunk') {
				this.output.bundle[consumedFile.fileName] = this.createPrebuiltChunk(consumedFile);
			}
		}
		for (const [sourceHash, consumedFiles] of consumedAssetsByHash) {
			this.finalizeAssetsWithSameSource(consumedFiles, sourceHash, output);
		}
	};

	private addOutputFileEmitter(outputFileEmitter: FileEmitter) {
		this.outputFileEmitters.push(outputFileEmitter);
	}

	private assignReferenceId(file: ConsumedFile, idBase: string): string {
		let referenceId = idBase;

		do {
			referenceId = createHash().update(referenceId).digest('hex').slice(0, 8);
		} while (
			this.filesByReferenceId.has(referenceId) ||
			this.outputFileEmitters.some(({ filesByReferenceId }) => filesByReferenceId.has(referenceId))
		);
		file.referenceId = referenceId;
		this.filesByReferenceId.set(referenceId, file);
		for (const { filesByReferenceId } of this.outputFileEmitters) {
			filesByReferenceId.set(referenceId, file);
		}
		return referenceId;
	}

	private createPrebuiltChunk(prebuiltChunk: ConsumedPrebuiltChunk): OutputChunk {
		return {
			code: prebuiltChunk.code,
			dynamicImports: [],
			exports: prebuiltChunk.exports || [],
			facadeModuleId: null,
			fileName: prebuiltChunk.fileName,
			implicitlyLoadedBefore: [],
			importedBindings: {},
			imports: [],
			isDynamicEntry: false,
			isEntry: false,
			isImplicitEntry: false,
			map: prebuiltChunk.map || null,
			moduleIds: [],
			modules: {},
			name: prebuiltChunk.fileName,
			preliminaryFileName: prebuiltChunk.fileName,
			referencedFiles: [],
			sourcemapFileName: prebuiltChunk.sourcemapFileName || null,
			type: 'chunk'
		};
	}

	private emitAsset(emittedAsset: EmittedFile): string {
		const source =
			emittedAsset.source === undefined
				? undefined
				: getValidSource(emittedAsset.source, emittedAsset, null);
		const consumedAsset: ConsumedAsset = {
			fileName: emittedAsset.fileName,
			name: emittedAsset.name,
			needsCodeReference: !!emittedAsset.needsCodeReference,
			referenceId: '',
			source,
			type: 'asset'
		};
		const referenceId = this.assignReferenceId(
			consumedAsset,
			emittedAsset.fileName || emittedAsset.name || String(this.nextIdBase++)
		);
		if (this.output) {
			this.emitAssetWithReferenceId(consumedAsset, this.output);
		} else {
			for (const fileEmitter of this.outputFileEmitters) {
				fileEmitter.emitAssetWithReferenceId(consumedAsset, fileEmitter.output!);
			}
		}
		return referenceId;
	}

	private emitAssetWithReferenceId(
		consumedAsset: Readonly<ConsumedAsset>,
		output: FileEmitterOutput
	) {
		const { fileName, source } = consumedAsset;
		if (fileName) {
			reserveFileNameInBundle(fileName, output, this.options.onLog);
		}
		if (source !== undefined) {
			this.finalizeAdditionalAsset(consumedAsset, source, output);
		}
	}

	private emitChunk(emittedChunk: EmittedFile): string {
		if (this.graph.phase > BuildPhase.LOAD_AND_PARSE) {
			return error(logInvalidRollupPhaseForChunkEmission());
		}
		if (typeof emittedChunk.id !== 'string') {
			return error(
				logFailedValidation(
					`Emitted chunks need to have a valid string id, received "${emittedChunk.id}"`
				)
			);
		}
		const consumedChunk: ConsumedChunk = {
			fileName: emittedChunk.fileName,
			module: null,
			name: emittedChunk.name || emittedChunk.id,
			referenceId: '',
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

	private emitPrebuiltChunk(
		emitPrebuiltChunk: Omit<EmittedFile, 'fileName' | 'name'> &
			Pick<EmittedPrebuiltChunk, 'exports' | 'map'>
	): string {
		if (typeof emitPrebuiltChunk.code !== 'string') {
			return error(
				logFailedValidation(
					`Emitted prebuilt chunks need to have a valid string code, received "${emitPrebuiltChunk.code}".`
				)
			);
		}
		if (
			typeof emitPrebuiltChunk.fileName !== 'string' ||
			isPathFragment(emitPrebuiltChunk.fileName)
		) {
			return error(
				logFailedValidation(
					`The "fileName" property of emitted prebuilt chunks must be strings that are neither absolute nor relative paths, received "${emitPrebuiltChunk.fileName}".`
				)
			);
		}
		const consumedPrebuiltChunk: ConsumedPrebuiltChunk = {
			code: emitPrebuiltChunk.code,
			exports: emitPrebuiltChunk.exports,
			fileName: emitPrebuiltChunk.fileName,
			map: emitPrebuiltChunk.map,
			referenceId: '',
			type: 'prebuilt-chunk'
		};
		const referenceId = this.assignReferenceId(
			consumedPrebuiltChunk,
			consumedPrebuiltChunk.fileName
		);
		if (this.output) {
			this.output.bundle[consumedPrebuiltChunk.fileName] =
				this.createPrebuiltChunk(consumedPrebuiltChunk);
		}
		return referenceId;
	}

	private finalizeAdditionalAsset(
		consumedFile: Readonly<ConsumedAsset>,
		source: string | Uint8Array,
		{ bundle, fileNamesBySource, outputOptions }: FileEmitterOutput
	): void {
		let { fileName, needsCodeReference, referenceId } = consumedFile;

		// Deduplicate assets if an explicit fileName is not provided
		if (!fileName) {
			const sourceHash = getSourceHash(source);
			fileName = fileNamesBySource.get(sourceHash);
			if (!fileName) {
				fileName = generateAssetFileName(
					consumedFile.name,
					source,
					sourceHash,
					outputOptions,
					bundle
				);
				fileNamesBySource.set(sourceHash, fileName);
			}
		}

		// We must not modify the original assets to avoid interaction between outputs
		const assetWithFileName = { ...consumedFile, fileName, source };
		this.filesByReferenceId.set(referenceId, assetWithFileName);

		const existingAsset = bundle[fileName];
		if (existingAsset?.type === 'asset') {
			existingAsset.needsCodeReference &&= needsCodeReference;
		} else {
			bundle[fileName] = {
				fileName,
				name: consumedFile.name,
				needsCodeReference,
				source,
				type: 'asset'
			};
		}
	}

	private finalizeAssetsWithSameSource(
		consumedFiles: ReadonlyArray<ConsumedAsset>,
		sourceHash: string,
		{ bundle, fileNamesBySource, outputOptions }: FileEmitterOutput
	): void {
		let fileName = '';
		let usedConsumedFile: ConsumedAsset;
		let needsCodeReference = true;
		for (const consumedFile of consumedFiles) {
			needsCodeReference &&= consumedFile.needsCodeReference;
			const assetFileName = generateAssetFileName(
				consumedFile.name,
				consumedFile.source!,
				sourceHash,
				outputOptions,
				bundle
			);
			if (
				!fileName ||
				assetFileName.length < fileName.length ||
				(assetFileName.length === fileName.length && assetFileName < fileName)
			) {
				fileName = assetFileName;
				usedConsumedFile = consumedFile;
			}
		}
		fileNamesBySource.set(sourceHash, fileName);

		for (const consumedFile of consumedFiles) {
			// We must not modify the original assets to avoid interaction between outputs
			const assetWithFileName = { ...consumedFile, fileName };
			this.filesByReferenceId.set(consumedFile.referenceId, assetWithFileName);
		}

		bundle[fileName] = {
			fileName,
			name: usedConsumedFile!.name,
			needsCodeReference,
			source: usedConsumedFile!.source!,
			type: 'asset'
		};
	}
}
