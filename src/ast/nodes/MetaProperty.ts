import type MagicString from 'magic-string';
import type { InternalModuleFormat } from '../../rollup/types';
import { escapeId } from '../../utils/escapeId';
import type { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import { DOCUMENT_CURRENT_SCRIPT } from '../../utils/interopHelpers';
import { dirname, normalize, relative } from '../../utils/path';
import type { PluginDriver } from '../../utils/PluginDriver';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import type ChildScope from '../scopes/ChildScope';
import type { ObjectPath } from '../utils/PathTracker';
import type Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

const FILE_PREFIX = 'ROLLUP_FILE_URL_';
const FILE_OBJ_PREFIX = 'ROLLUP_FILE_URL_OBJ_';
const IMPORT = 'import';

export default class MetaProperty extends NodeBase {
	declare meta: Identifier;
	declare property: Identifier;
	declare type: NodeType.tMetaProperty;

	private metaProperty: string | null = null;
	private preliminaryChunkId: string | null = null;
	private referenceId: string | null = null;

	getReferencedFileName(outputPluginDriver: PluginDriver): string | null {
		const {
			meta: { name },
			metaProperty
		} = this;
		if (name === IMPORT) {
			if (metaProperty?.startsWith(FILE_OBJ_PREFIX)) {
				return outputPluginDriver.getFileName(metaProperty.slice(FILE_OBJ_PREFIX.length));
			} else if (metaProperty?.startsWith(FILE_PREFIX)) {
				return outputPluginDriver.getFileName(metaProperty.slice(FILE_PREFIX.length));
			}
		}
		return null;
	}

	hasEffects(): boolean {
		return false;
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return path.length > 1 || type !== INTERACTION_ACCESSED;
	}

	include(): void {
		if (!this.included) this.includeNode();
	}

	includeNode() {
		this.included = true;
		if (this.meta.name === IMPORT) {
			this.scope.context.addImportMeta(this);
			const parent = this.parent;
			const metaProperty = (this.metaProperty =
				parent instanceof MemberExpression && typeof parent.propertyKey === 'string'
					? parent.propertyKey
					: null);
			if (metaProperty?.startsWith(FILE_OBJ_PREFIX)) {
				this.referenceId = metaProperty.slice(FILE_OBJ_PREFIX.length);
			} else if (metaProperty?.startsWith(FILE_PREFIX)) {
				this.referenceId = metaProperty.slice(FILE_PREFIX.length);
			}
		}
	}

	render(code: MagicString, renderOptions: RenderOptions): void {
		const { format, pluginDriver, snippets } = renderOptions;
		const {
			scope: {
				context: { module }
			},
			meta: { name },
			metaProperty,
			parent,
			preliminaryChunkId,
			referenceId,
			start,
			end
		} = this;
		const {
			id: moduleId,
			info: { attributes }
		} = module;

		if (name !== IMPORT) return;
		const chunkId = preliminaryChunkId!;

		if (referenceId) {
			const fileName = pluginDriver.getFileName(referenceId);
			const relativePath = normalize(relative(dirname(chunkId), fileName));
			const isUrlObject = !!metaProperty?.startsWith(FILE_OBJ_PREFIX);
			const replacement =
				pluginDriver.hookFirstSync('resolveFileUrl', [
					{ attributes, chunkId, fileName, format, moduleId, referenceId, relativePath }
				]) || relativeUrlMechanisms[format](relativePath, isUrlObject);

			code.overwrite(
				(parent as MemberExpression).start,
				(parent as MemberExpression).end,
				replacement,
				{ contentOnly: true }
			);
			return;
		}

		let replacement = pluginDriver.hookFirstSync('resolveImportMeta', [
			metaProperty,
			{ attributes, chunkId, format, moduleId }
		]);
		if (!replacement) {
			replacement = importMetaMechanisms[format]?.(metaProperty, { chunkId, snippets });
			renderOptions.accessedDocumentCurrentScript ||=
				formatsMaybeAccessDocumentCurrentScript.includes(format) && replacement !== 'undefined';
		}
		if (typeof replacement === 'string') {
			if (parent instanceof MemberExpression) {
				code.overwrite(parent.start, parent.end, replacement, { contentOnly: true });
			} else {
				code.overwrite(start, end, replacement, { contentOnly: true });
			}
		}
	}

	setResolution(
		format: InternalModuleFormat,
		accessedGlobalsByScope: Map<ChildScope, Set<string>>,
		preliminaryChunkId: string
	): void {
		this.preliminaryChunkId = preliminaryChunkId;
		const accessedGlobals = (
			this.metaProperty?.startsWith(FILE_PREFIX) || this.metaProperty?.startsWith(FILE_OBJ_PREFIX)
				? accessedFileUrlGlobals
				: accessedMetaUrlGlobals
		)[format];
		if (accessedGlobals.length > 0) {
			this.scope.addAccessedGlobals(accessedGlobals, accessedGlobalsByScope);
		}
	}
}

export const formatsMaybeAccessDocumentCurrentScript = ['cjs', 'iife', 'umd'];

const accessedMetaUrlGlobals = {
	amd: ['document', 'module', 'URL'],
	cjs: ['document', 'require', 'URL', DOCUMENT_CURRENT_SCRIPT],
	es: [],
	iife: ['document', 'URL', DOCUMENT_CURRENT_SCRIPT],
	system: ['module'],
	umd: ['document', 'require', 'URL', DOCUMENT_CURRENT_SCRIPT]
};

const accessedFileUrlGlobals = {
	amd: ['document', 'require', 'URL'],
	cjs: ['document', 'require', 'URL'],
	es: [],
	iife: ['document', 'URL'],
	system: ['module', 'URL'],
	umd: ['document', 'require', 'URL']
};

const getResolveUrl = (path: string, asObject: boolean, URL = 'URL') =>
	`new ${URL}(${path})${asObject ? '' : '.href'}`;

const getRelativeUrlFromDocument = (relativePath: string, asObject: boolean, umd = false) =>
	getResolveUrl(
		`'${escapeId(relativePath)}', ${
			umd ? `typeof document === 'undefined' ? location.href : ` : ''
		}document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI`,
		asObject
	);

const getGenericImportMetaMechanism =
	(getUrl: (chunkId: string) => string) =>
	(property: string | null, { chunkId }: { chunkId: string }) => {
		const urlMechanism = getUrl(chunkId);
		return property === null
			? `({ url: ${urlMechanism} })`
			: property === 'url'
				? urlMechanism
				: 'undefined';
	};

const getFileUrlFromFullPath = (path: string, asObject: boolean) =>
	`require('u' + 'rl').pathToFileURL(${path})${asObject ? '' : '.href'}`;

const getFileUrlFromRelativePath = (path: string, asObject: boolean) =>
	getFileUrlFromFullPath(`__dirname + '/${escapeId(path)}'`, asObject);

const getUrlFromDocument = (chunkId: string, umd = false) =>
	`${
		umd ? `typeof document === 'undefined' ? location.href : ` : ''
	}(${DOCUMENT_CURRENT_SCRIPT} && ${DOCUMENT_CURRENT_SCRIPT}.tagName.toUpperCase() === 'SCRIPT' && ${DOCUMENT_CURRENT_SCRIPT}.src || new URL('${escapeId(
		chunkId
	)}', document.baseURI).href)`;

const relativeUrlMechanisms: Record<
	InternalModuleFormat,
	(relativePath: string, asObject: boolean) => string
> = {
	amd: (relativePath, asObject: boolean) => {
		if (relativePath[0] !== '.') relativePath = './' + relativePath;
		return getResolveUrl(`require.toUrl('${escapeId(relativePath)}'), document.baseURI`, asObject);
	},
	cjs: (relativePath, asObject: boolean) =>
		`(typeof document === 'undefined' ? ${getFileUrlFromRelativePath(relativePath, asObject)} : ${getRelativeUrlFromDocument(relativePath, asObject)})`,
	es: (relativePath, asObject: boolean) =>
		getResolveUrl(`'${escapeId(relativePath)}', import.meta.url`, asObject),
	iife: (relativePath, asObject: boolean) => getRelativeUrlFromDocument(relativePath, asObject),
	system: (relativePath, asObject: boolean) =>
		getResolveUrl(`'${escapeId(relativePath)}', module.meta.url`, asObject),
	umd: (relativePath, asObject: boolean) =>
		`(typeof document === 'undefined' && typeof location === 'undefined' ? ${getFileUrlFromRelativePath(relativePath, asObject)} : ${getRelativeUrlFromDocument(relativePath, asObject, true)})`
};

const importMetaMechanisms: Record<
	string,
	(property: string | null, options: { chunkId: string; snippets: GenerateCodeSnippets }) => string
> = {
	amd: getGenericImportMetaMechanism(() => getResolveUrl(`module.uri, document.baseURI`, false)),
	cjs: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' ? ${getFileUrlFromFullPath('__filename', false)} : ${getUrlFromDocument(chunkId)})`
	),
	iife: getGenericImportMetaMechanism(chunkId => getUrlFromDocument(chunkId)),
	system: (property, { snippets: { getPropertyAccess } }) =>
		property === null ? `module.meta` : `module.meta${getPropertyAccess(property)}`,
	umd: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' && typeof location === 'undefined' ? ${getFileUrlFromFullPath('__filename', false)} : ${getUrlFromDocument(chunkId, true)})`
	)
};
