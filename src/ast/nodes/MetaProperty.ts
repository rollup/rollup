import MagicString from 'magic-string';
import { InternalModuleFormat } from '../../rollup/types';
import { PluginDriver } from '../../utils/PluginDriver';
import { warnDeprecation } from '../../utils/error';
import { dirname, normalize, relative } from '../../utils/path';
import ChildScope from '../scopes/ChildScope';
import { ObjectPathKey } from '../utils/PathTracker';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

const ASSET_PREFIX = 'ROLLUP_ASSET_URL_';
const CHUNK_PREFIX = 'ROLLUP_CHUNK_URL_';
const FILE_PREFIX = 'ROLLUP_FILE_URL_';

export default class MetaProperty extends NodeBase {
	meta!: Identifier;
	property!: Identifier;
	type!: NodeType.tMetaProperty;

	private metaProperty?: string | null;

	addAccessedGlobals(
		format: InternalModuleFormat,
		accessedGlobalsByScope: Map<ChildScope, Set<string>>
	): void {
		const metaProperty = this.metaProperty;
		const accessedGlobals = (
			metaProperty &&
			(metaProperty.startsWith(FILE_PREFIX) ||
				metaProperty.startsWith(ASSET_PREFIX) ||
				metaProperty.startsWith(CHUNK_PREFIX))
				? accessedFileUrlGlobals
				: accessedMetaUrlGlobals
		)[format];
		if (accessedGlobals.length > 0) {
			this.scope.addAccessedGlobals(accessedGlobals, accessedGlobalsByScope);
		}
	}

	getReferencedFileName(outputPluginDriver: PluginDriver): string | null {
		const metaProperty = this.metaProperty as string | null;
		if (metaProperty && metaProperty.startsWith(FILE_PREFIX)) {
			return outputPluginDriver.getFileName(metaProperty.substr(FILE_PREFIX.length));
		}
		return null;
	}

	hasEffects(): boolean {
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPathKey[]): boolean {
		return path.length > 1;
	}

	include(): void {
		if (!this.included) {
			this.included = true;
			if (this.meta.name === 'import') {
				this.context.addImportMeta(this);
				const parent = this.parent;
				this.metaProperty =
					parent instanceof MemberExpression && typeof parent.propertyKey === 'string'
						? parent.propertyKey
						: null;
			}
		}
	}

	renderFinalMechanism(
		code: MagicString,
		chunkId: string,
		format: InternalModuleFormat,
		outputPluginDriver: PluginDriver
	): void {
		const parent = this.parent;
		const metaProperty = this.metaProperty as string | null;

		if (
			metaProperty &&
			(metaProperty.startsWith(FILE_PREFIX) ||
				metaProperty.startsWith(ASSET_PREFIX) ||
				metaProperty.startsWith(CHUNK_PREFIX))
		) {
			let referenceId: string | null = null;
			let assetReferenceId: string | null = null;
			let chunkReferenceId: string | null = null;
			let fileName: string;
			if (metaProperty.startsWith(FILE_PREFIX)) {
				referenceId = metaProperty.substr(FILE_PREFIX.length);
				fileName = outputPluginDriver.getFileName(referenceId);
			} else if (metaProperty.startsWith(ASSET_PREFIX)) {
				warnDeprecation(
					`Using the "${ASSET_PREFIX}" prefix to reference files is deprecated. Use the "${FILE_PREFIX}" prefix instead.`,
					true,
					this.context.options
				);
				assetReferenceId = metaProperty.substr(ASSET_PREFIX.length);
				fileName = outputPluginDriver.getFileName(assetReferenceId);
			} else {
				warnDeprecation(
					`Using the "${CHUNK_PREFIX}" prefix to reference files is deprecated. Use the "${FILE_PREFIX}" prefix instead.`,
					true,
					this.context.options
				);
				chunkReferenceId = metaProperty.substr(CHUNK_PREFIX.length);
				fileName = outputPluginDriver.getFileName(chunkReferenceId);
			}
			const relativePath = normalize(relative(dirname(chunkId), fileName));
			let replacement;
			if (assetReferenceId !== null) {
				replacement = outputPluginDriver.hookFirstSync('resolveAssetUrl', [
					{
						assetFileName: fileName,
						chunkId,
						format,
						moduleId: this.context.module.id,
						relativeAssetPath: relativePath
					}
				]);
			}
			if (!replacement) {
				replacement =
					outputPluginDriver.hookFirstSync('resolveFileUrl', [
						{
							assetReferenceId,
							chunkId,
							chunkReferenceId,
							fileName,
							format,
							moduleId: this.context.module.id,
							referenceId: referenceId || assetReferenceId || chunkReferenceId!,
							relativePath
						}
					]) || relativeUrlMechanisms[format](relativePath);
			}

			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				replacement,
				{ contentOnly: true }
			);
			return;
		}

		const replacement =
			outputPluginDriver.hookFirstSync('resolveImportMeta', [
				metaProperty,
				{
					chunkId,
					format,
					moduleId: this.context.module.id
				}
			]) || importMetaMechanisms[format]?.(metaProperty, chunkId);
		if (typeof replacement === 'string') {
			if (parent instanceof MemberExpression) {
				code.overwrite(parent.start, parent.end, replacement, { contentOnly: true });
			} else {
				code.overwrite(this.start, this.end, replacement, { contentOnly: true });
			}
		}
	}
}

const accessedMetaUrlGlobals = {
	amd: ['document', 'module', 'URL'],
	cjs: ['document', 'require', 'URL'],
	es: [],
	iife: ['document', 'URL'],
	system: ['module'],
	umd: ['document', 'require', 'URL']
};

const accessedFileUrlGlobals = {
	amd: ['document', 'require', 'URL'],
	cjs: ['document', 'require', 'URL'],
	es: [],
	iife: ['document', 'URL'],
	system: ['module', 'URL'],
	umd: ['document', 'require', 'URL']
};

const getResolveUrl = (path: string, URL = 'URL') => `new ${URL}(${path}).href`;

const getRelativeUrlFromDocument = (relativePath: string, umd = false) =>
	getResolveUrl(
		`'${relativePath}', ${
			umd ? `typeof document === 'undefined' ? location.href : ` : ''
		}document.currentScript && document.currentScript.src || document.baseURI`
	);

const getGenericImportMetaMechanism =
	(getUrl: (chunkId: string) => string) => (prop: string | null, chunkId: string) => {
		const urlMechanism = getUrl(chunkId);
		return prop === null
			? `({ url: ${urlMechanism} })`
			: prop === 'url'
			? urlMechanism
			: 'undefined';
	};

const getUrlFromDocument = (chunkId: string, umd = false) =>
	`${
		umd ? `typeof document === 'undefined' ? location.href : ` : ''
	}(document.currentScript && document.currentScript.src || new URL('${chunkId}', document.baseURI).href)`;

const relativeUrlMechanisms: Record<InternalModuleFormat, (relativePath: string) => string> = {
	amd: relativePath => {
		if (relativePath[0] !== '.') relativePath = './' + relativePath;
		return getResolveUrl(`require.toUrl('${relativePath}'), document.baseURI`);
	},
	cjs: relativePath =>
		`(typeof document === 'undefined' ? ${getResolveUrl(
			`'file:' + __dirname + '/${relativePath}'`,
			`(require('u' + 'rl').URL)`
		)} : ${getRelativeUrlFromDocument(relativePath)})`,
	es: relativePath => getResolveUrl(`'${relativePath}', import.meta.url`),
	iife: relativePath => getRelativeUrlFromDocument(relativePath),
	system: relativePath => getResolveUrl(`'${relativePath}', module.meta.url`),
	umd: relativePath =>
		`(typeof document === 'undefined' && typeof location === 'undefined' ? ${getResolveUrl(
			`'file:' + __dirname + '/${relativePath}'`,
			`(require('u' + 'rl').URL)`
		)} : ${getRelativeUrlFromDocument(relativePath, true)})`
};

const importMetaMechanisms: Record<string, (prop: string | null, chunkId: string) => string> = {
	amd: getGenericImportMetaMechanism(() => getResolveUrl(`module.uri, document.baseURI`)),
	cjs: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' ? ${getResolveUrl(
				`'file:' + __filename`,
				`(require('u' + 'rl').URL)`
			)} : ${getUrlFromDocument(chunkId)})`
	),
	iife: getGenericImportMetaMechanism(chunkId => getUrlFromDocument(chunkId)),
	system: prop => (prop === null ? `module.meta` : `module.meta.${prop}`),
	umd: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' && typeof location === 'undefined' ? ${getResolveUrl(
				`'file:' + __filename`,
				`(require('u' + 'rl').URL)`
			)} : ${getUrlFromDocument(chunkId, true)})`
	)
};
