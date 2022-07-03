import type MagicString from 'magic-string';
import type { InternalModuleFormat } from '../../rollup/types';
import type { PluginDriver } from '../../utils/PluginDriver';
import type { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import { dirname, normalize, relative } from '../../utils/path';
import { INTERACTION_ACCESSED, NodeInteraction } from '../NodeInteractions';
import type ChildScope from '../scopes/ChildScope';
import type { ObjectPath } from '../utils/PathTracker';
import type Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

const FILE_PREFIX = 'ROLLUP_FILE_URL_';

export default class MetaProperty extends NodeBase {
	declare meta: Identifier;
	declare property: Identifier;
	declare type: NodeType.tMetaProperty;

	private declare metaProperty?: string | null;

	addAccessedGlobals(
		format: InternalModuleFormat,
		accessedGlobalsByScope: Map<ChildScope, Set<string>>
	): void {
		const metaProperty = this.metaProperty;
		const accessedGlobals = (
			metaProperty && metaProperty.startsWith(FILE_PREFIX)
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
			return outputPluginDriver.getFileName(metaProperty.substring(FILE_PREFIX.length));
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
		snippets: GenerateCodeSnippets,
		outputPluginDriver: PluginDriver
	): void {
		const parent = this.parent;
		const metaProperty = this.metaProperty as string | null;

		if (metaProperty && metaProperty.startsWith(FILE_PREFIX)) {
			let referenceId: string | null = null;
			referenceId = metaProperty.substring(FILE_PREFIX.length);
			const fileName = outputPluginDriver.getFileName(referenceId);
			const relativePath = normalize(relative(dirname(chunkId), fileName));
			const replacement =
				outputPluginDriver.hookFirstSync('resolveFileUrl', [
					{
						chunkId,
						fileName,
						format,
						moduleId: this.context.module.id,
						referenceId,
						relativePath
					}
				]) || relativeUrlMechanisms[format](relativePath);

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
			]) || importMetaMechanisms[format]?.(metaProperty, { chunkId, snippets });
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
	(getUrl: (chunkId: string) => string) =>
	(prop: string | null, { chunkId }: { chunkId: string }) => {
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

const importMetaMechanisms: Record<
	string,
	(prop: string | null, options: { chunkId: string; snippets: GenerateCodeSnippets }) => string
> = {
	amd: getGenericImportMetaMechanism(() => getResolveUrl(`module.uri, document.baseURI`)),
	cjs: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' ? ${getResolveUrl(
				`'file:' + __filename`,
				`(require('u' + 'rl').URL)`
			)} : ${getUrlFromDocument(chunkId)})`
	),
	iife: getGenericImportMetaMechanism(chunkId => getUrlFromDocument(chunkId)),
	system: (prop, { snippets: { getPropertyAccess } }) =>
		prop === null ? `module.meta` : `module.meta${getPropertyAccess(prop)}`,
	umd: getGenericImportMetaMechanism(
		chunkId =>
			`(typeof document === 'undefined' && typeof location === 'undefined' ? ${getResolveUrl(
				`'file:' + __filename`,
				`(require('u' + 'rl').URL)`
			)} : ${getUrlFromDocument(chunkId, true)})`
	)
};
