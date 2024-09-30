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
import type { GetHash } from './crypto';
import { getHash64, hasherByType } from './crypto';
import { getOrCreate } from './getOrCreate';
import { DEFAULT_HASH_SIZE } from './hashPlaceholders';
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
	logNoAssetSourceSet,
	warnDeprecation
} from './logs';
import type { OutputBundleWithPlaceholders } from './outputBundle';
import { FILE_PLACEHOLDER, lowercaseBundleKeys } from './outputBundle';
import { extname } from './path';
import { isPathFragment } from './relativeId';
import { makeUnique, renderNamePattern } from './renderNamePattern';
import { URL_GENERATEBUNDLE } from './urls';

function generateAssetFileName(
	name: string | undefined,
	names: string[],
	source: string | Uint8Array,
	originalFileName: string | null,
	originalFileNames: string[],
	sourceHash: string,
	outputOptions: NormalizedOutputOptions,
	bundle: OutputBundleWithPlaceholders,
	inputOptions: NormalizedInputOptions
): string {
	const emittedName = outputOptions.sanitizeFileName(name || 'asset');
	return makeUnique(
		renderNamePattern(
			typeof outputOptions.assetFileNames === 'function'
				? outputOptions.assetFileNames({
						// Additionally, this should be non-enumerable in the next major
						get name() {
							warnDeprecation(
								'Accessing the "name" property of emitted assets when generating the file name is deprecated. Use the "names" property instead.',
								URL_GENERATEBUNDLE,
								false,
								inputOptions
							);
							return name;
						},
						names,
						// Additionally, this should be non-enumerable in the next major
						get originalFileName() {
							warnDeprecation(
								'Accessing the "originalFileName" property of emitted assets when generating the file name is deprecated. Use the "originalFileNames" property instead.',
								URL_GENERATEBUNDLE,
								false,
								inputOptions
							);
							return originalFileName;
						},
						originalFileNames,
						source,
						type: 'asset'
					})
				: outputOptions.assetFileNames,
			'output.assetFileNames',
			{
				ext: () => extname(emittedName).slice(1),
				extname: () => extname(emittedName),
				hash: size => sourceHash.slice(0, Math.max(0, size || DEFAULT_HASH_SIZE)),
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
	originalFileName: string | null;
	referenceId: string;
};

type ConsumedFile = ConsumedChunk | ConsumedAsset | ConsumedPrebuiltChunk;

type EmittedFileType = ConsumedFile['type'];

interface EmittedFile {
	[key: string]: unknown;
	fileName?: string;
	name?: string;
	originalFileName?: string | null;
	type: EmittedFileType;
}

const emittedFileTypes = new Set<EmittedFileType>(['chunk', 'asset', 'prebuilt-chunk']);

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
	fileNamesBySourceHash: Map<string, string>;
	outputOptions: NormalizedOutputOptions;
	getHash: GetHash;
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
		const getHash = hasherByType[outputOptions.hashCharacters];
		const output = (this.output = {
			bundle,
			fileNamesBySourceHash: new Map<string, string>(),
			getHash,
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
					const sourceHash = getHash(consumedFile.source);
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
			referenceId = getHash64(referenceId).slice(0, 8).replaceAll('-', '$');
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
		const originalFileName = emittedAsset.originalFileName || null;
		if (typeof originalFileName === 'string') {
			this.graph.watchFiles[originalFileName] = true;
		}
		const consumedAsset: ConsumedAsset = {
			fileName: emittedAsset.fileName,
			name: emittedAsset.name,
			needsCodeReference: !!emittedAsset.needsCodeReference,
			originalFileName,
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
		{ bundle, fileNamesBySourceHash, getHash, outputOptions }: FileEmitterOutput
	): void {
		let { fileName, name, needsCodeReference, originalFileName, referenceId } = consumedFile;

		// Deduplicate assets if an explicit fileName is not provided
		if (!fileName) {
			const sourceHash = getHash(source);
			fileName = fileNamesBySourceHash.get(sourceHash);
			if (!fileName) {
				fileName = generateAssetFileName(
					name,
					name ? [name] : [],
					source,
					originalFileName,
					originalFileName ? [originalFileName] : [],
					sourceHash,
					outputOptions,
					bundle,
					this.options
				);
				fileNamesBySourceHash.set(sourceHash, fileName);
			}
		}

		// We must not modify the original assets to avoid interaction between outputs
		const assetWithFileName = { ...consumedFile, fileName, source };
		this.filesByReferenceId.set(referenceId, assetWithFileName);

		const existingAsset = bundle[fileName];
		if (existingAsset?.type === 'asset') {
			existingAsset.needsCodeReference &&= needsCodeReference;
			if (name) {
				existingAsset.names.push(name);
			}
			if (originalFileName) {
				existingAsset.originalFileNames.push(originalFileName);
			}
		} else {
			const { options } = this;
			bundle[fileName] = {
				fileName,
				get name() {
					// Additionally, this should be non-enumerable in the next major
					warnDeprecation(
						'Accessing the "name" property of emitted assets in the bundle is deprecated. Use the "names" property instead.',
						URL_GENERATEBUNDLE,
						false,
						options
					);
					return name;
				},
				names: name ? [name] : [],
				needsCodeReference,
				get originalFileName() {
					// Additionally, this should be non-enumerable in the next major
					warnDeprecation(
						'Accessing the "originalFileName" property of emitted assets in the bundle is deprecated. Use the "originalFileNames" property instead.',
						URL_GENERATEBUNDLE,
						false,
						options
					);
					return originalFileName;
				},
				originalFileNames: originalFileName ? [originalFileName] : [],
				source,
				type: 'asset'
			};
		}
	}

	private finalizeAssetsWithSameSource(
		consumedFiles: readonly ConsumedAsset[],
		sourceHash: string,
		{ bundle, fileNamesBySourceHash, outputOptions }: FileEmitterOutput
	): void {
		const { names, originalFileNames } = getNamesFromAssets(consumedFiles);
		let fileName = '';
		let usedConsumedFile: ConsumedAsset;
		let needsCodeReference = true;
		for (const consumedFile of consumedFiles) {
			needsCodeReference &&= consumedFile.needsCodeReference;
			const assetFileName = generateAssetFileName(
				consumedFile.name,
				names,
				consumedFile.source!,
				consumedFile.originalFileName,
				originalFileNames,
				sourceHash,
				outputOptions,
				bundle,
				this.options
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
		fileNamesBySourceHash.set(sourceHash, fileName);

		for (const consumedFile of consumedFiles) {
			// We must not modify the original assets to avoid interaction between outputs
			const assetWithFileName = { ...consumedFile, fileName };
			this.filesByReferenceId.set(consumedFile.referenceId, assetWithFileName);
		}

		const { options } = this;
		bundle[fileName] = {
			fileName,
			get name() {
				// Additionally, this should be non-enumerable in the next major
				warnDeprecation(
					'Accessing the "name" property of emitted assets in the bundle is deprecated. Use the "names" property instead.',
					URL_GENERATEBUNDLE,
					false,
					options
				);
				return usedConsumedFile!.name;
			},
			names,
			needsCodeReference,
			get originalFileName() {
				// Additionally, this should be non-enumerable in the next major
				warnDeprecation(
					'Accessing the "originalFileName" property of emitted assets in the bundle is deprecated. Use the "originalFileNames" property instead.',
					URL_GENERATEBUNDLE,
					false,
					options
				);
				return usedConsumedFile!.originalFileName;
			},
			originalFileNames,
			source: usedConsumedFile!.source!,
			type: 'asset'
		};
	}
}

function getNamesFromAssets(consumedFiles: readonly ConsumedAsset[]): {
	names: string[];
	originalFileNames: string[];
} {
	const names: string[] = [];
	const originalFileNames: string[] = [];
	for (const { name, originalFileName } of consumedFiles) {
		if (typeof name === 'string') {
			names.push(name);
		}
		if (originalFileName) {
			originalFileNames.push(originalFileName);
		}
	}
	originalFileNames.sort();
	// Sort by length first and then alphabetically so that the order is stable
	// and the shortest names come first
	names.sort((a, b) => a.length - b.length || (a > b ? 1 : a === b ? 0 : -1));
	return { names, originalFileNames };
}
