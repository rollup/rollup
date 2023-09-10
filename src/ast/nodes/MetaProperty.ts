import type MagicString from 'magic-string';
import type { InternalModuleFormat } from '../../rollup/types';
import type { PluginDriver } from '../../utils/PluginDriver';
import { escapeId } from '../../utils/escapeId';
import type { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import { DOCUMENT_CURRENT_SCRIPT } from '../../utils/interopHelpers';
import { dirname, normalize, relative } from '../../utils/path';
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
		if (name === IMPORT && metaProperty?.startsWith(FILE_PREFIX)) {
			return outputPluginDriver.getFileName(metaProperty.slice(FILE_PREFIX.length));
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
		if (!this.included) {
			this.included = true;
			if (this.meta.name === IMPORT) {
				this.context.addImportMeta(this);
				const parent = this.parent;
				const metaProperty = (this.metaProperty =
					parent instanceof MemberExpression && typeof parent.propertyKey === 'string'
						? parent.propertyKey
						: null);
				if (metaProperty?.startsWith(FILE_PREFIX)) {
					this.referenceId = metaProperty.slice(FILE_PREFIX.length);
				}
			}
		}
	}

	render(code: MagicString, renderOptions: RenderOptions): void {
		const { format, pluginDriver, snippets } = renderOptions;
		const {
			context: { module },
			meta: { name },
			metaProperty,
			parent,
			preliminaryChunkId,
			referenceId,
			start,
			end
		} = this;
		const { id: moduleId } = module;

		if (name !== IMPORT) return;
		const chunkId = preliminaryChunkId!;

		if (referenceId) {
			const fileName = pluginDriver.getFileName(referenceId);
			const relativePath = normalize(relative(dirname(chunkId), fileName));
			const replacement =
				pluginDriver.hookFirstSync('resolveFileUrl', [
					{ chunkId, fileName, format, moduleId, referenceId, relativePath }
				]) || relativeUrlMechanisms[format](relativePath);

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
			{ chunkId, format, moduleId }
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
			this.metaProperty?.startsWith(FILE_PREFIX) ? accessedFileUrlGlobals : accessedMetaUrlGlobals
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

const getResolveUrl = (path: string, URL = 'URL') => `new ${URL}(${path}).href`;

const getRelativeUrlFromDocument = (relativePath: string, umd = false) =>
	getResolveUrl(
		`'${escapeId(relativePath)}', ${
			umd ? `typeof document === 'undefined' ? location.href : ` : ''
		}document.currentScript && document.currentScript.src || document.baseURI`
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

const getFileUrlFromFullPath = (path: string) => `require('u' + 'rl').pathToFileURL(${path}).href`;

const getFileUrlFromRelativePath = (path: string) =>
	getFileUrlFromFullPath(`__dirname + '/${path}'`);

const getUrlFromDocument = (chunkId: string, umd = false) =>
	`${
		umd ? `typeof document === 'undefined' ? location.href : ` : ''
	}(${DOCUMENT_CURRENT_SCRIPT} && ${DOCUMENT_CURRENT_SCRIPT}.src || new URL('${escapeId(
		chunkId
	)}', document.baseURI).href)`;

const relativeUrlMechanisms: Record<InternalModuleFormat, (relativePath: string) => string> = {
	amd: relativePath => {
		if (relativePath[0] !== '.') relativePath = './' + relativePath;
		return getResolveUrl(`require.toUrl('${relativePath}'), document.baseURI`);
	},
	cjs: relativePath =>
		`(typeof document === 'undefined' ? ${getFileUrlFromRelativePath(
			relativePath
		)} : ${getRelativeUrlFromDocument(relativePath)})`,
	es: relativePath => getResolveUrl(`'${relativePath}', import.meta.url`),
	iife: relativePath => getRelativeUrlFromDocument(relativePath),
	system: relativePath => getResolveUrl(`'${relativePath}', module.meta.url`),
	umd: relativePath =>
		`(typeof document === 'undefined' && typeof location === 'undefined' ? ${getFileUrlFromRelativePath(
			relativePath
		)} : ${getRelativeUrlFromDocument(relativePath, true)})`
};

const importMetaMechanisms: Record<
	string,
	(property: string | null, options: { chunkId: string; snippets: GenerateCodeSnippets }) => string
> = {
	amd: getGenericImportMetaMechanism(() => getResolveUrl(`module.uri, document.baseURI`)),
	cjs: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' ? ${getFileUrlFromFullPath(
				'__filename'
			)} : ${getUrlFromDocument(chunkId)})`
	),
	iife: getGenericImportMetaMechanism(chunkId => getUrlFromDocument(chunkId)),
	system: (property, { snippets: { getPropertyAccess } }) =>
		property === null ? `module.meta` : `module.meta${getPropertyAccess(property)}`,
	umd: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' && typeof location === 'undefined' ? ${getFileUrlFromFullPath(
				'__filename'
			)} : ${getUrlFromDocument(chunkId, true)})`
	)
};
